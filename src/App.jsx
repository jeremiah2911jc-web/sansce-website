import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CircleHelp,
  Compass,
  FileText,
  Handshake,
  Layers3,
  Mail,
  Phone,
  ShieldCheck,
  Wallet,
  Wrench,
} from "lucide-react";

const services = [
  {
    title: "前期可行性評估",
    desc: "評估基地條件、更新路徑與整體可行性，建立推動基礎判斷。",
    icon: Compass,
  },
  {
    title: "住戶整合與推動輔導",
    desc: "協助社區建立溝通機制，形成初步共識與推動節奏。",
    icon: Handshake,
  },
  {
    title: "更新組織及程序輔導",
    desc: "輔導組織建立與程序規劃，推進制度化作業。",
    icon: FileText,
  },
  {
    title: "補助及財務資源整合",
    desc: "盤點補助資源與財務條件，協助建立推動所需資源基礎。",
    icon: Wallet,
  },
  {
    title: "專業整合與全案管理",
    desc: "跨領域整合專業團隊與節點管理，掌握整體推動節奏。",
    icon: Layers3,
  },
  {
    title: "執行銜接與後段管理",
    desc: "進入執行階段後持續顧問協調，確保成果落地。",
    icon: Wrench,
  },
];

const promises = [
  {
    title: "信實",
    desc: "站在委託方立場，資訊不隱瞞、程序不美化、風險不迴避。真實的評估，是穩健推動的起點。",
  },
  {
    title: "整合",
    desc: "都市更新涉及建築、法務、財務、估價、工程與金融。三策協助整合跨專業環節，讓每一段工作彼此銜接。",
  },
  {
    title: "落地",
    desc: "再完整的規劃，若無法付諸執行，仍只是紙面工程。三策重視節點管理與成果實現。",
  },
];

const fitCases = [
  "老舊社區有都市更新或危老重建需求，但尚不清楚如何啟動",
  "地主群體希望保有主導權，自主推動更新",
  "已接觸多個專業單位，卻缺乏整合統籌的核心平台",
  "更新案件卡在某個階段，需要有人協助突破瓶頸",
  "面對複雜程序感到迷茫，希望有專業夥伴穩定陪伴推進",
];

const insightTopics = [
  "什麼是都市更新？自主更新與委託實施有何不同？",
  "都市更新的七大程序階段，你現在走到哪裡？",
  "全案管理顧問在更新案中扮演什麼角色？",
  "前期可行性評估，為什麼是更新最重要的第一步？",
  "社區整合遲遲無法推進？常見的五個核心原因",
  "危老重建與都市更新，如何選擇適合的更新路徑？",
];

function SectionTag({ children }) {
  return (
    <div className="inline-flex items-center rounded-full border border-[#d5dce4] bg-white px-4 py-2 text-sm font-medium text-[#0b4f79] shadow-sm">
      {children}
    </div>
  );
}

function SectionTitle({ eyebrow, title, desc, light = false }) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <div className={`text-sm font-semibold tracking-[0.18em] uppercase ${light ? "text-[#dcb770]" : "text-[#b08a48]"}`}>
          {eyebrow}
        </div>
      ) : null}
      <h2 className={`mt-3 text-3xl font-semibold tracking-tight sm:text-4xl ${light ? "text-white" : "text-[#11213b]"}`}>
        {title}
      </h2>
      {desc ? (
        <p className={`mt-5 text-base leading-8 ${light ? "text-slate-200" : "text-slate-600"}`}>
          {desc}
        </p>
      ) : null}
    </div>
  );
}

export default function SansceCompanyWebsite() {
  return (
    <div className="min-h-screen bg-[#f7f4ee] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-[#dde5ea] bg-white/94 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#0b4f79] text-sm font-bold text-[#0b4f79]">
              三策
            </div>
            <div>
              <div className="text-base font-semibold text-[#0b4f79]">三策專案管理顧問有限公司</div>
              <div className="text-sm text-slate-500">都市更新・自主更新・全案管理顧問平台</div>
            </div>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-[#0b4f79]">關於我們</a>
            <a href="#services" className="text-sm font-medium text-slate-600 hover:text-[#0b4f79]">服務項目</a>
            <a href="#insights" className="text-sm font-medium text-slate-600 hover:text-[#0b4f79]">知識專區</a>
            <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-[#0b4f79]">聯絡我們</a>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#eef5f7_0%,#f7f4ee_100%)]">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-[-60px] top-24 h-64 w-64 rounded-full bg-[#d6ebee]" />
            <div className="absolute right-[-100px] top-8 h-80 w-80 rounded-full bg-[#113f64]" />
            <div className="absolute right-28 top-40 h-28 w-28 rounded-full bg-[#f0dfcb]" />
            <div className="absolute left-[38%] bottom-10 h-40 w-40 rounded-full bg-white/70" />
          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <SectionTag>都市更新・自主更新・全案管理顧問平台</SectionTag>
              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-[#11213b] sm:text-5xl lg:text-6xl">
                把複雜更新案件，
                <span className="block">變成可以穩定推進的專案</span>
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">
                三策專注都市更新、自主更新與全案管理顧問服務，協助委託方釐清方向、整合專業、掌握節點，讓案件從混亂走向有序。
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0b4f79] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5">
                  預約初步諮詢
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#services" className="inline-flex items-center justify-center rounded-full border border-[#d6dde3] bg-white px-6 py-3.5 text-sm font-semibold text-[#0b4f79] shadow-sm">
                  了解我們的服務
                </a>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }}>
              <div className="rounded-[36px] bg-white p-8 shadow-[0_28px_80px_-34px_rgba(17,33,59,0.28)]">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ["前期評估", "建立推動基礎"],
                    ["整合協調", "降低溝通耗損"],
                    ["程序輔導", "推進制度作業"],
                    ["全案管理", "掌握整體節奏"],
                  ].map(([title, text], idx) => (
                    <div key={title} className={`rounded-[24px] p-5 ${idx === 0 ? "bg-[#0b4f79] text-white" : idx === 1 ? "bg-[#e6f0f1] text-[#0b4f79]" : idx === 2 ? "bg-[#f0e3d6] text-[#11213b]" : "bg-[#d7ebde] text-[#11213b]"}`}>
                      <div className="text-lg font-semibold">{title}</div>
                      <div className="mt-2 text-sm opacity-80">{text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-6 py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Pain Points"
              title="您是否正面對這些困境？"
              desc="都市更新流程複雜，不知從哪裡開始？對接了多個專業單位，卻始終無法整合成一個可執行的方向？擔心資訊不透明、程序失控，錯失更新時機？社區意見分歧，推動遲遲沒有進展？"
            />
            <div className="mt-6 rounded-[28px] bg-white px-8 py-6 text-xl font-semibold text-[#0b4f79] shadow-sm">
              這些問題，正是三策存在的理由。
            </div>
          </div>
        </section>

        <section id="about" className="bg-white px-6 py-16 lg:px-8 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <SectionTitle
              eyebrow="Positioning"
              title="我們是誰"
              desc="三策專案管理顧問有限公司，專注都市更新與自主更新的全案管理顧問服務。"
            />
            <div className="rounded-[32px] bg-[#f7f4ee] p-8 text-base leading-8 text-slate-700">
              我們的工作，是幫委託方把方向看清楚、把程序走穩健、把案件真正往前推進。從前期評估、住戶整合、組織建立，到程序申請、財務規劃與工程管理，三策以整體專案視角協助統整環節，讓每一個關鍵節點都有人掌握、有人管理。
            </div>
          </div>
        </section>

        <section id="services" className="px-6 py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Services"
              title="服務亮點"
              desc="依照案件推動階段，提供從前期評估到後段執行的完整顧問服務。"
            />
            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {services.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: index * 0.06 }}
                    className="rounded-[30px] bg-white p-8 shadow-[0_20px_60px_-40px_rgba(17,33,59,0.35)]"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e6f0f1] text-[#0b4f79]">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold text-[#11213b]">{item.title}</h3>
                    <p className="mt-4 text-base leading-8 text-slate-600">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-10">
              <a href="#services-detail" className="inline-flex items-center gap-2 rounded-full bg-[#0b4f79] px-6 py-3.5 text-sm font-semibold text-white shadow-sm">
                查看完整服務內容
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        <section className="bg-white px-6 py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <SectionTitle eyebrow="Core Values" title="三策的三個承諾" />
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {promises.map((item) => (
                <div key={item.title} className="rounded-[30px] border border-[#e4e1da] bg-[#f7f4ee] p-8">
                  <div className="text-2xl font-semibold text-[#0b4f79]">{item.title}</div>
                  <p className="mt-5 text-base leading-8 text-slate-700">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl rounded-[36px] bg-[#11213b] px-8 py-10 text-white lg:px-12">
            <SectionTitle
              eyebrow="Fit"
              title="以下情境，三策可以協助您"
              desc="適合正要啟動都更、危老、自主更新、整合溝通與全案管理需求的委託方。"
              light
            />
            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              {fitCases.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[22px] bg-white/8 px-5 py-4 text-base leading-7 text-slate-100">
                  <CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-[#dcb770]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="services-detail" className="bg-white px-6 py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl space-y-8">
            <SectionTitle
              eyebrow="Service Details"
              title="我們能為您做什麼"
              desc="都市更新涉及的面向廣泛，每一個階段都需要不同的專業判斷與管理能量。"
            />

            {[
              {
                title: "服務一：前期可行性評估",
                text: "在決定是否啟動更新之前，先掌握基地條件與推動可行性。三策協助分析基地與建物現況、法規適用、更新路徑、整合難度、初步效益與執行風險，幫助委託方在案件初期做出更有根據的判斷。",
              },
              {
                title: "服務二：住戶整合與推動輔導",
                text: "社區整合往往是更新最困難也最關鍵的一環。三策協助整理住戶意見、建立可溝通的資訊框架、規劃說明架構，並輔導社區形成初步共識，讓整合過程更有方法與節奏。",
              },
              {
                title: "服務三：更新組織及程序輔導",
                text: "都市更新的推動，需要正式的組織架構與程序規劃。三策協助完成推動組織建立、程序規劃、文件整備與提報輔導，讓案件從討論階段進入制度化的正式推動軌道。",
              },
              {
                title: "服務四：補助及財務資源整合",
                text: "前期資金與補助資源的有效運用，對案件啟動與推進具有關鍵影響。三策協助盤點補助資源、評估資金安排方向，並整合必要的財務與金融協作。",
              },
              {
                title: "服務五：專業整合與全案管理",
                text: "這是三策最核心的定位。面對建築、法務、財務、估價、工程與金融等多方專業，三策以全案管理視角擔任整合平台，協助配置資源、建立協作機制、管理節點進度，讓複雜環節形成有效推進力量。",
              },
              {
                title: "服務六：執行銜接與後段管理協助",
                text: "案件進入執行階段後，仍需要穩定的管理支持。三策提供重要節點追蹤、各方協調、履約顧問支援與問題處理建議，讓案件在後段仍能維持管理能量與應變能力。",
              },
            ].map((item, index) => (
              <div key={item.title} className="rounded-[30px] bg-[#f7f4ee] p-8">
                <div className="text-sm font-semibold tracking-[0.16em] text-[#b08a48] uppercase">0{index + 1}</div>
                <h3 className="mt-3 text-2xl font-semibold text-[#11213b]">{item.title}</h3>
                <p className="mt-4 text-base leading-8 text-slate-700">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="insights" className="px-6 py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Insights"
              title="了解更新，從這裡開始"
              desc="都市更新過程複雜，資訊落差往往是推動困難的根源之一。三策整理實務知識、法規觀察與案例主題，協助委託方建立更清楚的判斷基礎。"
            />
            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[30px] bg-white p-8 shadow-sm">
                <div className="text-xl font-semibold text-[#0b4f79]">文章分類</div>
                <div className="mt-5 space-y-3 text-base text-slate-700">
                  <div>都市更新基礎知識</div>
                  <div>自主更新實務觀察</div>
                  <div>法規解析與政策動態</div>
                  <div>財務規劃與資源整合</div>
                  <div>全案管理實踐分享</div>
                </div>
              </div>
              <div className="rounded-[30px] bg-white p-8 shadow-sm">
                <div className="text-xl font-semibold text-[#0b4f79]">推薦文章主題</div>
                <div className="mt-5 space-y-3 text-base text-slate-700">
                  {insightTopics.map((item) => (
                    <div key={item}>{item}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="bg-white px-6 py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Contact"
              title="讓我們先了解您的案件"
              desc="每一件更新案件的條件都不同。歡迎先透過官方 LINE 與我們聯繫，三策將依案件狀況安排初步諮詢與後續溝通方向。"
            />

            <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[32px] bg-[#f7f4ee] p-8">
                <div className="text-2xl font-semibold text-[#11213b]">適合先與我們聯繫的情況</div>
                <div className="mt-6 space-y-4 text-base leading-8 text-slate-700">
                  {[
                    "基地條件與更新方向尚未釐清",
                    "社區已開始討論，但缺乏整合推動主軸",
                    "案件卡在某個節點，需要重新整理進度與分工",
                    "希望先評估是否適合都市更新或自主更新路徑",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-[22px] bg-white px-5 py-4 shadow-sm">
                      <div className="mt-2 h-2.5 w-2.5 rounded-full bg-[#b08a48]" />
                      <div>{item}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] bg-[#11213b] p-8 text-white">
                <div className="flex items-center gap-3 text-2xl font-semibold">
                  <Building2 className="h-6 w-6 text-[#dcb770]" />
                  聯絡資訊
                </div>
                <div className="mt-8 space-y-5 text-base text-slate-200">
                  <div>公司名稱：三策專案管理顧問有限公司</div>
                  <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-[#dcb770]" />服務電話：（待提供）</div>
                  <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-[#dcb770]" />電子郵件：（待提供）</div>
                  <div>辦公地址：依正式上線資訊補入</div>
                  <div>服務時間：週一至週五 09:00－18:00</div>
                </div>

                <div className="mt-8 rounded-[28px] bg-white/10 p-5">
                  <div className="text-lg font-semibold text-white">官方 LINE</div>
                  <div className="mt-2 text-sm text-slate-300">LINE ID：@160rlvqj</div>
                  <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <img
                      src="https://qr-official.line.me/gs/M_160rlvqj_BW.png"
                      alt="三策官方 LINE QR code"
                      className="h-32 w-32 rounded-2xl bg-white p-2"
                    />
                    <div className="flex-1">
                      <p className="text-sm leading-7 text-slate-200">
                        掃描 QR code 或點擊下方按鈕，即可加入三策官方 LINE，作為主要聯絡與初步諮詢方式。
                      </p>
                      <a
                        href="https://line.me/R/ti/p/@160rlvqj"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#06c755] px-5 py-3 text-sm font-semibold text-white"
                      >
                        加入 LINE 官方帳號
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0b4f79] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_0.8fr_0.8fr] lg:px-8">
          <div>
            <div className="text-2xl font-semibold">三策專案管理顧問有限公司</div>
            <div className="mt-3 text-slate-200">以信實立本　以專業成事</div>
            <div className="mt-4 text-sm text-slate-300">都市更新・自主更新・全案管理顧問平台</div>
          </div>
          <div>
            <div className="text-lg font-semibold">快速連結</div>
            <div className="mt-4 space-y-2 text-slate-200">
              <div>首頁</div>
              <div>關於我們</div>
              <div>服務項目</div>
              <div>知識專區</div>
              <div>聯絡我們</div>
            </div>
          </div>
          <div className="flex items-end text-slate-200">© 2026 三策專案管理顧問有限公司 版權所有</div>
        </div>
      </footer>
    </div>
  );
}
