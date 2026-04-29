import { telegramOrderUrl } from "@/lib/contacts";

type Props = {
  productName: string;
  size?: "sm" | "lg";
  className?: string;
};

export default function OrderButton({
  productName,
  size = "sm",
  className = "",
}: Props) {
  const sizeClass =
    size === "lg"
      ? "px-6 py-3 text-base"
      : "px-3 py-1.5 text-sm";
  return (
    <a
      href={telegramOrderUrl(productName)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center rounded-full bg-rose-400 font-medium text-white shadow-sm transition-colors hover:bg-rose-600 ${sizeClass} ${className}`}
    >
      Заказать
    </a>
  );
}
