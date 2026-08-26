import type { Translator } from "@/i18n";

interface CycleRow {
  cycle: string;
  range: string;
  example: string;
}

/**
 * Bảng chu kỳ được nhận diện. Ngoài việc tăng độ tin cậy, đây là loại nội dung
 * có cấu trúc mà công cụ tìm kiếm và các engine trả lời bằng AI trích dẫn được:
 * thẻ table + caption + th scope thật, không phải div giả bảng.
 */
export function CycleTable({ t, tList }: Pick<Translator, "t" | "tList">) {
  const rows = tList<CycleRow>("demo.cycleRows");

  return (
    <details className="mt-8 rounded-xl border border-line bg-surface transition-colors duration-200 open:border-brand-600 hover:border-line-strong">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 font-heading text-[1.0625rem] font-semibold">
        {t("demo.detailsTitle")}
      </summary>

      <div className="px-4 pb-4 text-[0.9375rem] text-muted">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">{t("demo.tableCaption")}</caption>
            <thead>
              <tr>
                <th scope="col" className="border-b border-line py-2 pr-4 font-heading text-ink">
                  {t("demo.thCycle")}
                </th>
                <th scope="col" className="border-b border-line py-2 pr-4 font-heading text-ink">
                  {t("demo.thRange")}
                </th>
                <th scope="col" className="border-b border-line py-2 font-heading text-ink">
                  {t("demo.thExample")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.cycle}>
                  <th scope="row" className="border-b border-line py-2 pr-4 font-semibold text-ink-2">
                    {row.cycle}
                  </th>
                  <td className="num border-b border-line py-2 pr-4">{row.range}</td>
                  <td className="border-b border-line py-2">{row.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4">{t("demo.detailsBody")}</p>
      </div>
    </details>
  );
}
