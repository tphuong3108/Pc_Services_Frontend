export default function ContactBox() {
  return (
    <div className="bg-blue-50 p-6 rounded-xl shadow-sm flex flex-col justify-between">
      <h3 className="text-lg font-semibold mb-2">
        Bạn có thắc mắc? Chúng tôi có câu trả lời!
      </h3>
      <p className="text-gray-600 text-sm mb-4">
        Trò chuyện với chuyên gia công nghệ của chúng tôi để được tư vấn và nhận
        giải đáp nhanh chóng. Đội ngũ kỹ thuật sẽ tiếp tục theo dõi bạn.
      </p>
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
        Nhấn để hỏi
      </button>
    </div>
  );
}
