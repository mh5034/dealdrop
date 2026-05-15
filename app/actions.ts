"use server";

import { scrapeProduct } from "@/lib/firecrawl";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Product, PriceHistory } from "@/lib/types";
import { AddProductResult, DeleteProductResult } from "@/lib/types";

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}

export async function addProduct(
  formData: FormData,
): Promise<AddProductResult> {
  const url = formData.get("url") as string;

  if (!url) {
    return { success: false, error: "URL is required" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const productData = await scrapeProduct(url);

    if (!productData.productName || !productData.currentPrice) {
      console.log(productData, "productData");
      return {
        success: false,
        error: "Could not extract product information from this URL",
      };
    }

    const newPrice = productData.currentPrice;
    const currency = productData.currencyCode || "USD";

    const { data: existingProduct } = await supabase
      .from("products")
      .select("id, current_price")
      .eq("user_id", user.id)
      .eq("url", url)
      .single();

    const isUpdate = !!existingProduct;

    const { data: product, error } = await supabase
      .from("products")
      .upsert(
        {
          user_id: user.id,
          url,
          name: productData.productName,
          current_price: newPrice,
          currency,
          image_url: productData.productImageUrl,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,url",
          ignoreDuplicates: false,
        },
      )
      .select()
      .single();

    if (error) throw error;

    const shouldAddHistory =
      !isUpdate || existingProduct.current_price !== newPrice;

    if (shouldAddHistory) {
      await supabase.from("price_history").insert({
        product_id: product.id,
        price: newPrice,
        currency,
      });
    }

    revalidatePath("/");

    return {
      success: true,
      product: product as Product,
      message: isUpdate
        ? "Product updated with latest price!"
        : "Product added successfully",
    };
  } catch (error) {
    console.error("Add product error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to add product";
    return { success: false, error: message };
  }
}

export async function deleteProduct(
  productId: string,
): Promise<DeleteProductResult> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) throw error;

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete product";
    return { success: false, error: message };
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as Product[]) || [];
  } catch (error) {
    console.error("Get products error:", error);
    return [];
  }
}

export async function getPriceHistory(
  productId: string,
): Promise<PriceHistory[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("price_history")
      .select("*")
      .eq("product_id", productId)
      .order("checked_at", { ascending: true });

    if (error) throw error;
    return (data as PriceHistory[]) || [];
  } catch (error) {
    console.error("Get price history error:", error);
    return [];
  }
}
