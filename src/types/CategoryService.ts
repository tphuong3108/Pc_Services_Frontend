export type CategoryService = {
  _id: string
  name: string
  slug: string
  description?: string
  status: "active" | "inactive" | "hidden"
  createdAt?: string
  updatedAt?: string
}
