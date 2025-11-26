import ServiceList from "./components/ServiceList";
import FAQSection from "./components/FAQSection";
import ContactBox from "./components/ContactBox";

export default function UserServicePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <ServiceList />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <FAQSection />
        </div>
        <ContactBox />
      </div>
    </div>
  );
}
