import type { Metadata } from "next";
import Link from "next/link";
import { company } from "@/lib/siteContent";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description:
    "Политика обработки персональных данных сайта Автоком 54. Как используются данные из формы заявки на ремонт грузовой техники.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10 text-zinc-950 md:px-6">
      <article className="mx-auto max-w-3xl rounded-md border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
        <Link href="/" className="text-sm font-bold text-red-700">
          На главную
        </Link>

        <h1 className="mt-6 text-3xl font-black md:text-5xl">
          Политика конфиденциальности
        </h1>
        <p className="mt-4 leading-8 text-zinc-700">
          Настоящая политика описывает, как сайт {company.name} обрабатывает
          данные, которые пользователь оставляет в форме заявки.
        </p>

        <section className="mt-8 grid gap-6">
          <div>
            <h2 className="text-xl font-black">Какие данные собираются</h2>
            <p className="mt-3 leading-8 text-zinc-700">
              Имя, номер телефона, модель техники, выбранная услуга и описание
              неисправности. Эти данные нужны только для обработки обращения и
              обратной связи с клиентом.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black">Как используются данные</h2>
            <p className="mt-3 leading-8 text-zinc-700">
              Данные используются для связи с клиентом, уточнения деталей
              ремонта, согласования времени визита и ведения заявок внутри
              сервиса.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black">Передача третьим лицам</h2>
            <p className="mt-3 leading-8 text-zinc-700">
              Персональные данные не публикуются и не передаются третьим лицам,
              кроме случаев, когда это требуется по закону или необходимо для
              обработки заявки.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-black">Контакты</h2>
            <p className="mt-3 leading-8 text-zinc-700">
              По вопросам обработки данных можно обратиться по телефонам:
            </p>
            <div className="mt-3 grid gap-2">
              {company.phones.map((phone) => (
                <a
                  key={phone.href}
                  href={phone.href}
                  className="font-bold text-red-700"
                >
                  {phone.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
