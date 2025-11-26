// types/Banner.ts
export type LayoutOption = "option1" | "option2" | "option3";
export type SizeOption = "large" | "small";

export type Banner = {
  _id: string;
  title: string;
  description: string;
  image: { url: string; public_id?: string };
  link: string;
  position: number;
  layout?: LayoutOption; // FE dùng option
  size?: SizeOption; // FE hiển thị size
  updatedAt?: string;
}

// API trả về từ backend (layout = number, size = 'large'|'small')
export interface BannerApi {
  _id: string;
  title: string;
  description: string;
  image: { url: string; public_id?: string };
  link: string;
  position: number;
  layout?: number; // BE lưu số
  size?: SizeOption;
  updatedAt?: string;
}
