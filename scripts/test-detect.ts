/**
 * Kiểm thử engine phát hiện subscription trên hai sao kê mẫu.
 *
 *   npm test
 *
 * Chạy bằng test runner có sẵn của Node (node:test) + type stripping, nên
 * không cần thêm dependency nào.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyze, normalizeDescriptor, parseAmount } from "../src/lib/detect.ts";
import { SAMPLES } from "../src/lib/samples.ts";

/** Ngày cố định để kỳ vọng về "còn bao nhiêu ngày" không đổi theo thời gian. */
const TODAY = new Date(Date.UTC(2026, 7, 26));

describe("parseAmount", () => {
  it("hiểu dấu chấm phân cách nghìn kiểu Việt Nam", () => {
    assert.equal(parseAmount("260.000"), 260000);
    assert.equal(parseAmount("-1.290.000"), -1290000);
    assert.equal(parseAmount("28.547.000"), 28547000);
  });

  it("hiểu dấu chấm thập phân kiểu quốc tế", () => {
    assert.equal(parseAmount("15.49"), 15.49);
    assert.equal(parseAmount("1,234.56"), 1234.56);
    assert.equal(parseAmount("-11.99"), -11.99);
  });

  it("hiểu số âm trong ngoặc và ký hiệu tiền tệ", () => {
    assert.equal(parseAmount("(50.00)"), -50);
    assert.equal(parseAmount("260.000 VND"), 260000);
    assert.equal(parseAmount("$20.00"), 20);
  });

  it("trả về null với dữ liệu không phải số", () => {
    assert.equal(parseAmount("NETFLIX.COM"), null);
    assert.equal(parseAmount(""), null);
  });
});

describe("normalizeDescriptor", () => {
  it("gỡ số điện thoại và mã quốc gia khỏi descriptor", () => {
    assert.equal(normalizeDescriptor("NETFLIX.COM 866-579-7172 US"), "NETFLIX.COM");
  });

  it("gỡ tiền tố cổng thanh toán", () => {
    assert.equal(normalizeDescriptor("POS SHOPEE VN"), "SHOPEE");
    assert.equal(normalizeDescriptor("SQ *BLUE BOTTLE COFFEE"), "BLUE BOTTLE COFFEE");
  });

  it("gộp các lần trừ tiền của cùng một dịch vụ về một khoá", () => {
    const a = normalizeDescriptor("ADOBE CREATIVE CLOUD DUBLIN IE");
    const b = normalizeDescriptor("ADOBE CREATIVE CLOUD DUBLIN");
    assert.equal(a, b);
  });
});

describe("sao kê mẫu tiếng Việt", () => {
  const result = analyze(SAMPLES.vi.statement, { today: TODAY, localeDayFirst: true });

  it("nhận đúng đồng tiền VND", () => {
    assert.equal(result.currency, "VND");
  });

  it("tìm được 8 subscription", () => {
    assert.equal(result.subscriptions.length, 8);
  });

  it("tổng đúng 2.378.917₫ mỗi tháng", () => {
    assert.equal(Math.round(result.stats.totalMonthly), 2378917);
  });

  it("không nhầm cột số dư thành cột số tiền", () => {
    const netflix = result.subscriptions.find((sub) => sub.name === "Netflix");
    assert.ok(netflix);
    assert.equal(netflix.amount, 260000);
  });

  it("loại lương và các giao dịch tiền vào", () => {
    assert.ok(!result.subscriptions.some((sub) => /LUONG/i.test(sub.merchant)));
  });

  it("loại chi tiêu không đều: Grab, cà phê, tiền điện", () => {
    const names = result.subscriptions.map((sub) => sub.name.toUpperCase()).join(" ");
    for (const noise of ["GRAB", "HIGHLANDS", "EVN", "SHOPEE"]) {
      assert.ok(!names.includes(noise), `${noise} không được coi là subscription`);
    }
  });

  it("nhận ra gói hàng năm chỉ xuất hiện 2 lần, nhưng hạ điểm tin cậy", () => {
    const yearly = result.subscriptions.find((sub) => sub.cycle === "annual");
    assert.ok(yearly, "phải tìm ra gói hàng năm");
    assert.equal(yearly.name, "Namecheap");
    assert.equal(yearly.occurrences, 2);
    assert.equal(yearly.confidenceLevel, "medium");
  });

  it("tính ngày trừ tiền kế tiếp trong tương lai", () => {
    for (const sub of result.subscriptions) {
      assert.ok(sub.nextCharge >= TODAY, `${sub.name} có ngày gia hạn trong quá khứ`);
      assert.ok(sub.daysUntilNext >= 0);
    }
  });

  it("quy đổi gói hàng năm về chi phí mỗi tháng", () => {
    const yearly = result.subscriptions.find((sub) => sub.cycle === "annual");
    assert.ok(yearly);
    assert.equal(Math.round(yearly.monthlyAmount), Math.round(yearly.amount / 12));
  });
});

describe("sao kê mẫu tiếng Anh", () => {
  const result = analyze(SAMPLES.en.statement, { today: TODAY, localeDayFirst: false });

  it("nhận đúng đồng tiền USD và định dạng ngày mm/dd", () => {
    assert.equal(result.currency, "USD");
  });

  it("tìm được 8 subscription, tổng 99.04 mỗi tháng", () => {
    assert.equal(result.subscriptions.length, 8);
    assert.equal(result.stats.totalMonthly, 99.04);
  });

  it("nhận diện đúng tên thương hiệu từ descriptor bẩn", () => {
    const names = result.subscriptions.map((sub) => sub.name);
    for (const expected of ["Netflix", "Spotify", "ChatGPT Plus", "Apple iCloud", "GitHub"]) {
      assert.ok(names.includes(expected), `thiếu ${expected}`);
    }
  });

  it("loại các giao dịch một lần", () => {
    const names = result.subscriptions.map((sub) => sub.name.toUpperCase()).join(" ");
    assert.ok(!names.includes("UBER"));
    assert.ok(!names.includes("WHOLE FOODS"));
  });
});

describe("dữ liệu rác", () => {
  it("không sập với chuỗi vô nghĩa", () => {
    const result = analyze("đây không phải sao kê", { today: TODAY });
    assert.equal(result.subscriptions.length, 0);
    assert.equal(result.stats.transactions, 0);
  });

  it("không sập với chuỗi rỗng", () => {
    const result = analyze("", { today: TODAY });
    assert.equal(result.subscriptions.length, 0);
  });

  it("cần ít nhất 2 lần trừ tiền mới coi là subscription", () => {
    const result = analyze("12/08/2026,NETFLIX.COM,-260.000", { today: TODAY, localeDayFirst: true });
    assert.equal(result.subscriptions.length, 0);
  });
});
