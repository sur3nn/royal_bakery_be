

export function mapApiProductToProduct(raw: any): any {
  return {
    id: String(raw.id),
    code: raw.code ?? `PR-${raw.id}`,
    name: raw.name ?? '',
    category: raw.category_name ?? '',
    categoryId: raw.category_id ?? undefined,
    sellingPrice: Number(raw.selling_price) || 0,
    costPrice: Number(raw.cost_price) || 0,
    unit: raw.unit ?? '',
    gstRate: Number(raw.gst_percent) || 0,
    stock: Number(raw.current_stock) || 0,
    minStock: Number(raw.min_stock_threshold) || 0,
    image: raw.image_url ?? '',
    hsnCode: raw.hsn_code ?? '',
    shelfLifeDays: raw.shelf_life_days != null ? Number(raw.shelf_life_days) : undefined,
    isHighDemand: !!raw.is_popular,
  };
}