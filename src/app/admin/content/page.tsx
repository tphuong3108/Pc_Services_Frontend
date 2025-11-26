// app/admin/static-content/page.tsx
import Tabs from "@/components/common/Tabs";
import BannerForm from "@/components/admin/content/BannerForm";
import DragDropBannerLayout from "@/components/common/Template";
import InfoForm from "@/components/admin/content/InfoForm";
import TableHeader from "@/components/admin/TableHeader";

function BannerTab() {
  return (
    <div className="flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0">
      {/* Left: DragDropBannerLayout */}
      <div className="md:w-2/3 w-full">
      <DragDropBannerLayout />
      </div>
      {/* Right: BannerForm */}
      <div className="md:w-1/3 w-full">
      <BannerForm />
      </div>
    </div>
  );
}

export default function StaticContentPage() {
  const tabs = [
    { label: "Chỉnh sửa khung ảnh", value: "banner", content: <BannerTab /> },
    { label: "Chỉnh sửa thông tin", value: "info", content: <InfoForm /> },
  ];

  return (
    <div className="p-6 bg-white shadow rounded-xl">
      <TableHeader
        title="Quản lý nội dung tĩnh"
        breadcrumb={["Admin", "Quản lý nội dung tĩnh"]}
      />
      <Tabs tabs={tabs} />
    </div>
  );
}