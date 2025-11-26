"use client";

import { Facebook, Instagram, Twitter } from "lucide-react";
import { infoService } from "@/services/info.services";
import { Info } from "@/types/Info";
import { useEffect, useState } from "react";

export default function Footer() {
  const [info, setInfo] = useState<Info | null>(null);
  const [socialLinks, setSocialLinks] = useState<{ facebook: string; instagram: string; twitter: string } | null>(null);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      if (info) {
        setSocialLinks({
          facebook: info.facebook || "",
          instagram: info.instagram || "",
          twitter: info.x || ""
        });
      };
    }
    fetchSocialLinks();
  }, [info]);

  useEffect(() => {
    const fetchInfo = async () => {
      const data = await infoService.getInfo();
      setInfo(data);
    };
    fetchInfo();
  }, []);

  return (
    <footer className="border-t border-gray-200 bg-[#F9F9F9]">
      {/* Top Section */}
      <div className="max-w-7xl w-full mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Contact */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Tên công ty: {info?.name}</h3>
          <p className="text-sm text-gray-600">Số điện thoại: {info?.phone}</p>
          <p className="text-sm text-gray-600">Email: {info?.email}</p>
          <p className="text-sm text-gray-600">Địa chỉ: {info?.address}</p>
        </div>

        {/* Working Hours */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Thời gian làm việc</h3>
          <p className="text-sm text-gray-600">Thứ hai tới Thứ bảy: 09:00 - 18:00</p>
          <p className="text-sm text-gray-600">Chủ nhật: 10:00 - 16:00</p>
        </div>

        {/* About Us */}
        {/* <div>
          <h3 className="font-semibold text-gray-800 mb-2">Về chúng tôi</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li><a href="#" className="hover:text-gray-900">Cửa hàng</a></li>
            <li><a href="#" className="hover:text-gray-900">Trang web công ty</a></li>
            <li><a href="#" className="hover:text-gray-900">Ưu đãi độc quyền</a></li>
            <li><a href="#" className="hover:text-gray-900">Chăm sóc</a></li>
          </ul>
        </div> */}

        {/* Help */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Trợ giúp & Hỗ trợ</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li><a href="/user/helpers" className="hover:text-gray-900">Trung tâm trợ giúp</a></li>
            <li><a href="/user/helpers?need=payment" className="hover:text-gray-900">Phương thức thanh toán</a></li>
            <li><a href="/user/helpers?need=return" className="hover:text-gray-900">Quy định đổi trả</a></li>
            <li><a href="/user/helpers/questions" className="hover:text-gray-900">Các câu hỏi thường gặp</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">
            Đăng ký để nhận ưu đãi độc quyền và tin tức mới nhất!
          </h3>
          <div className="flex mb-3">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button className="px-4 py-2 bg-blue-500 text-white rounded-r-lg text-sm">
              Gửi
            </button>
          </div>
          <div className="flex space-x-3">
            <a href={socialLinks?.facebook} className="text-gray-600 hover:text-blue-500">
              <Facebook size={20} />
            </a>
            <a href={socialLinks?.instagram} className="text-gray-600 hover:text-pink-500">
              <Instagram size={20} />
            </a>
            <a href={socialLinks?.twitter} className="text-gray-600 hover:text-sky-500">
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© 2024 DUDI. All Rights Reserved.</p>
          <div className="flex space-x-6 mt-2 md:mt-0">
            <a href="/user/helpers?need=policy" className="hover:text-gray-800">Chính sách bảo mật</a>
            <a href="/user/helpers?need=terms" className="hover:text-gray-800">Điều khoản và điều kiện</a>
            <a href="/user/helpers?need=imprint" className="hover:text-gray-800">Dấu ấn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
