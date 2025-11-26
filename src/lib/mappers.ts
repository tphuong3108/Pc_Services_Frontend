import { Product, ProductApi, UploadedImage } from "@/types/Product";
import { Category, CategoryApi } from "@/types/Category";
import { Rating, RatingApi } from "@/types/Rating";
import { Service, ServiceApi } from "@/types/Service";
import { Request, RequestApi } from "@/types/Request";
import { Stats, StatsApi } from "@/types/Stats";
// lib/mappers.ts
import { Banner, BannerApi, LayoutOption } from "@/types/Banner";
import { InfoApi, Info } from "@/types/Info";
import { Discount, DiscountApi } from "@/types/Discount";

/** Convert FE layout -> BE numeric */
export function mapLayoutToApi(layout?: LayoutOption | number): number | undefined {
  if (!layout && layout !== 0) return undefined;
  if (typeof layout === "number") return layout;
  switch (layout) {
    case "option1":
      return 1;
    case "option2":
      return 2;
    case "option3":
      return 3;
    default:
      return undefined;
  }
}

/** Convert BE numeric -> FE layout string */
export function mapLayoutFromApi(layout?: number): LayoutOption | undefined {
  if (!layout && layout !== 0) return undefined;
  switch (layout) {
    case 1:
      return "option1";
    case 2:
      return "option2";
    case 3:
      return "option3";
    default:
      return undefined;
  }
}

/** Map API banner -> FE Banner type (includes size & layout converted) */
export function mapBanner(apiData: BannerApi): Banner {
  return {
    _id: apiData._id,
    title: apiData.title,
    description: apiData.description,
    image: {
      url: apiData.image?.url || "",
      public_id: apiData.image?.public_id,
    },
    link: apiData.link,
    position: apiData.position,
    layout: mapLayoutFromApi(apiData.layout),
    size: apiData.size ?? undefined,
    updatedAt: apiData.updatedAt,
  };
}

export function mapCategory(apiData: CategoryApi): Category {
  return {
    _id: apiData._id,
    name: apiData.name,
    slug: apiData.slug,
    tags: apiData.tags || [],
    description: apiData.description,
    createdAt: apiData.createdAt,
    updatedAt: apiData.updatedAt,
  };
}

export function mapRating(apiData: RatingApi): Rating {
  return {
    _id: apiData._id as string,
    product_id: apiData.product_id,
    service_id: apiData.service_id,
    name: apiData.name,
    score: apiData.score,
    comment: apiData.comment,
    created_at: apiData.created_at,
    updated_at: apiData.updated_at,
  };
}

export function mapProduct(apiData: ProductApi): Product {
  return {
    _id: apiData._id,
    name: apiData.name,
    tags: apiData.tags || [],
    slug: apiData.slug,
    description: apiData.description ?? "",
    rating: apiData.avg_rating ?? 0,
    price: apiData.price,
    quantity: apiData.quantity,
    brand: apiData.brand,
    status: apiData.status as Product["status"],
    resolution: apiData.resolution,
    model: apiData.model,
    ports: apiData.ports || [],
    panel: apiData.panel,
    size: apiData.size,
    category_id: apiData.category_id,      
    category:
    typeof apiData.category === "object"
      ? {
          _id: apiData.category._id,
          name: apiData.category.name,
          slug: apiData.category.slug
        }
      : undefined,
    
    // ánh xạ images → luôn trả UploadedImage[]
    images: Array.isArray(apiData.images)
      ? (apiData.images as UploadedImage[]).map((img) => ({
          url: (img as UploadedImage).url,
          public_id: (img as UploadedImage).public_id,
        }))
      : [],
    
    sale_off: apiData.sale_off || 0,
    start_date: apiData.start_date ? new Date(apiData.start_date) : undefined,
    end_date: apiData.end_date ? new Date(apiData.end_date) : undefined,
    createdAt: apiData.createdAt,
    updatedAt: apiData.updatedAt,
  };
}

export function mapService(apiData: ServiceApi): Service {
  return {
    _id: apiData._id,
    name: apiData.name,
    description: apiData.description,
    price: apiData.price,
    type: apiData.type,
    slug: apiData.slug,
    estimated_time: apiData.estimated_time,
    status: apiData.status,
    created_at: apiData.created_at,
    updated_at: apiData.updated_at,
    category: apiData.category,
    images: apiData.images && Array.isArray(apiData.images)
      ? (apiData.images as UploadedImage[]).map((img) => ({
          url: (img as UploadedImage).url,
          public_id: (img as UploadedImage).public_id,
        }))
      : [],
    start_date: apiData.start_date ? new Date(apiData.start_date) : undefined,
    end_date: apiData.end_date ? new Date(apiData.end_date) : undefined,
    rating: apiData.avg_rating ?? 0,
    discount: apiData.sale_off ?? 0,
  }
}

export function mapRequest(apiData: RequestApi): Request {
  return {
  _id: apiData._id,
  name: apiData.name,
  email: apiData.email,
  phone: apiData.phone,
  address: apiData.address,
  problem_description: apiData.problem_description,
  items: apiData.items,
  note: apiData.note,
  repair_type: apiData.repair_type,
  estimated_time: apiData.estimated_time,
  status: apiData.status,
  service_id: apiData.service_id,
  images: Array.isArray(apiData.images)
    ? (apiData.images as UploadedImage[]).map((img) => ({
      url: (img as UploadedImage).url,
      public_id: (img as UploadedImage).public_id,
    }))
    : [],
  createdAt: apiData.createdAt,
  updatedAt: apiData.updatedAt,
  hidden: apiData.hidden ?? false,
};
}

export function statsMapper(apiData: StatsApi): Stats {
  return {
    visits: apiData.visits || 0,
    total_profit: apiData.total_profit || 0,
    total_repairs: apiData.total_repairs || 0,
    total_orders: apiData.total_orders || 0,
    total_products: apiData.total_products || 0,
    updatedAt: apiData.updatedAt || Date.now(),
  }
}

export function mapInfo(apiData: InfoApi): Info {
  return {
    _id: apiData._id,
    name: apiData.name,
    email: apiData.email,
    phone: apiData.phone,
    target: apiData.target,
    scope: apiData.scope,
    address: apiData.address,
    facebook: apiData.facebook,
    instagram: apiData.instagram,
    youtube: apiData.youtube,
    x: apiData.x,
    termsOfService: apiData.termsOfService,
    privacyPolicy: apiData.privacyPolicy,
  }
}

export function mapDiscount(apiData: DiscountApi): Discount {
  return {
    _id: apiData._id,
    product: {
      _id: apiData.product?._id || "",
      name: apiData.product?.name || "",
      images: apiData.product?.images || [],
      tags: apiData.product?.tags || [],
      slug: apiData.product?.slug || "",
      description: apiData.product?.description || "",
      price: apiData.product?.price || 0,
      quantity: apiData.product?.quantity || 0,
      brand: apiData.product?.brand || "",
      rating: apiData.product?.avg_rating || 0,
    } as Product,
    service: apiData.service ? mapService(apiData.service) : undefined,
    product_category_id: apiData.product_category_id,
    service_category_id: apiData.service_category_id,
    type: apiData.type,
    sale_off: apiData.sale_off,
    start_date: new Date(apiData.start_date),
    end_date: new Date(apiData.end_date),
  }
}
