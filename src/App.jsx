export default function SanscePMConsultingWebsitePremium() {
  const services = [
    {
      index: '01',
      title: '自主更新全案管理',
      desc: '協助地主與更新會整合基地條件、推動程序、跨專業協作與進度管控，建立清楚可執行的推動架構。',
    },
    {
      index: '02',
      title: '更新會籌組與治理協助',
      desc: '協助籌備組織架構、會議流程、文件管理與對外溝通，讓案件推進更有秩序。',
    },
    {
      index: '03',
      title: '專業團隊整合',
      desc: '串連建築、估價、地政、法律、財務、營造等專業資源，降低地主自行協調的負擔。',
    },
    {
      index: '04',
      title: '前期可行性評估',
      desc: '就基地條件、整合現況、推動難點與執行路徑進行初步評估，協助釐清下一步。',
    },
  ]

  const process = [
    {
      step: '01',
      title: '初步諮詢',
      desc: '了解基地位置、產權概況、地主共識與現階段主要困難。',
    },
    {
      step: '02',
      title: '案件評估',
      desc: '盤點條件與需求，提出推動方向、整合重點與合作建議。',
    },
    {
      step: '03',
      title: '整合啟動',
      desc: '建立窗口、協調專業團隊、安排會議與文件流程。',
    },
    {
      step: '04',
      title: '全案推進',
      desc: '持續控管進度、協作節點、資訊傳達與執行品質。',
    },
  ]

  const strengths = [
    '以地主端與更新會需求為核心',
    '重視程序秩序與執行品質',
    '整合跨領域專業而非單點服務',
    '用清楚流程降低溝通成本與不確定性',
  ]

  const metrics = [
    { label: '服務定位', value: '地主端' },
    { label: '核心能力', value: '統籌協作' },
    { label: '推進重點', value: '程序節點' },
  ]

  return (
    <div className="min-h-screen bg-[#f5f1ea] text-[#111827]">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111827]/92 text-white backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="三策 logo" className="h-10 w-auto object-contain md:h-12" />
            <div>
              <div className="text-[15px] font-semibold tracking-[0.16em] text-white">三策專案管理顧問有限公司</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.28em] text-white/60">San-Sce Project Management Consulting</div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            <a href="#about" className="transition hover:text-white">關於我們</a>
            <a href="#services" className="transition hover:text-white">服務項目</a>
            <a href="#process" className="transition hover:text-white">合作流程</a>
            <a href="#contact" className="transition hover:text-white">聯絡諮詢</a>
          </nav>

          <a
            href="#contact"
            className="hidden rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-[#111827] md:inline-flex"
          >
            預約諮詢
          </a>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(181,152,99,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(17,24,39,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.35),rgba(255,255,255,0))]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b59863]/50 to-transparent" />

          <div className="mx-auto grid max-w-7xl gap-14 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
            <div className="relative z-10">
              <div className="inline-flex items-center rounded-full border border-[#b59863]/30 bg-white/80 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.3em] text-[#6b5430] shadow-sm backdrop-blur">
                Urban Renewal · Owner-side Advisory
              </div>

              <h1 className="mt-7 max-w-3xl text-5xl font-semibold leading-[1.08] tracking-tight text-neutral-950 md:text-6xl">
                讓複雜的都市更新案件，
                <span className="mt-2 block text-neutral-500">進入更清楚、更穩定的推進節奏。</span>
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-9 text-neutral-600 md:text-[19px]">
                三策專案管理顧問有限公司，專注於自主更新案件的全案管理與專案統籌，
                協助地主與更新會整合條件、協調專業、梳理程序與控管節點，
                使案件在複雜意見與多方協作之中，仍能維持清楚方向。
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#contact"
                  className="rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-medium text-white shadow-[0_18px_45px_rgba(17,24,39,0.18)] transition hover:-translate-y-0.5"
                >
                  預約初步諮詢
                </a>
                <a
                  href="#services"
                  className="rounded-full border border-neutral-300 bg-white/85 px-7 py-3.5 text-sm font-medium text-neutral-800 transition hover:border-neutral-900 hover:bg-white"
                >
                  瀏覽服務內容
                </a>
              </div>

              <div className="mt-14 grid gap-5 sm:grid-cols-3">
                {metrics.map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">{item.label}</div>
                    <div className="mt-3 text-xl font-semibold text-neutral-950">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10">
              <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(250,247,241,0.88))] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl md:p-7">
                <div className="rounded-[1.75rem] border border-[#b59863]/20 bg-[#111827] p-7 text-white md:p-8">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.28em] text-white/50">Consulting Overview</div>
                      <div className="mt-3 text-3xl font-semibold leading-tight">地主端專業統籌</div>
                    </div>
                    <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">Owner-side</div>
                  </div>

                  <p className="mt-6 text-sm leading-8 text-white/72">
                    聚焦地主與更新會立場，從前期評估、團隊整合、程序節點到資訊傳達，建立可持續推進的專案管理架構。
                  </p>

                  <div className="mt-8 grid gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="text-xs uppercase tracking-[0.22em] text-white/40">核心價值</div>
                      <div className="mt-2 text-lg font-medium">程序、秩序、協作、推進</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="text-xs uppercase tracking-[0.22em] text-white/40">適用對象</div>
                      <div className="mt-2 text-sm leading-7 text-white/72">
                        基地地主、更新會籌備成員、社區代表窗口，以及正在評估自主更新路徑的案件團隊。
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.6rem] border border-black/5 bg-white p-5 shadow-sm">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">Focus</div>
                    <div className="mt-3 text-xl font-semibold text-neutral-950">專業整合</div>
                    <p className="mt-3 text-sm leading-7 text-neutral-600">串連建築、估價、法務、財務與營造端所需協作。</p>
                  </div>
                  <div className="rounded-[1.6rem] border border-black/5 bg-white p-5 shadow-sm">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">Approach</div>
                    <div className="mt-3 text-xl font-semibold text-neutral-950">節點控管</div>
                    <p className="mt-3 text-sm leading-7 text-neutral-600">讓討論、決策與執行不再分散失焦，形成穩定推進節奏。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-[#8a6a35]">About San-Sce</div>
              <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-neutral-950 md:text-5xl">
                我們的工作，是讓案件從眾聲雜沓，回到清楚可執行的架構。
              </h2>
              <p className="mt-8 max-w-3xl text-base leading-9 text-neutral-600 md:text-[17px]">
                自主更新案件常同時牽涉地主整合、組織治理、專業協作、程序推進與資訊傳達。三策所提供的，不只是單一專業意見，而是協助案件建立一致的推動邏輯、穩定的協調節奏與更清楚的執行架構。
              </p>
              <p className="mt-5 max-w-3xl text-base leading-9 text-neutral-600 md:text-[17px]">
                對地主端而言，真正困難的往往不是資訊不足，而是資訊過多、窗口分散、節點不明與責任模糊。因此我們更重視整體統籌、流程梳理與持續推進能力。
              </p>
            </div>

            <div className="rounded-[2rem] border border-black/5 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
              <div className="flex items-center justify-between gap-4">
                <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-neutral-500">Core Strengths</div>
                <div className="h-px flex-1 bg-gradient-to-r from-neutral-200 to-transparent" />
              </div>

              <div className="mt-8 space-y-4">
                {strengths.map((item, idx) => (
                  <div key={item} className="flex gap-4 rounded-[1.4rem] border border-neutral-100 bg-neutral-50/80 p-4 transition hover:bg-white">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">0{idx + 1}</div>
                    <div className="pt-1 text-sm leading-7 text-neutral-700">{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="border-y border-black/5 bg-white/70">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <div className="max-w-2xl">
              <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-[#8a6a35]">Services</div>
              <h2 className="mt-5 text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">服務項目</h2>
              <p className="mt-6 text-base leading-9 text-neutral-600 md:text-[17px]">
                從前期評估到整體推進，圍繞自主更新案件最關鍵的協作環節，建立有秩序的工作方式。
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-2">
              {services.map((service) => (
                <div
                  key={service.title}
                  className="group rounded-[2rem] border border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,246,241,0.92))] p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_70px_rgba(15,23,42,0.10)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-[11px] uppercase tracking-[0.3em] text-[#8a6a35]">Service {service.index}</div>
                    <div className="h-px flex-1 bg-gradient-to-r from-[#cbb27d]/50 to-transparent" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold tracking-tight text-neutral-950">{service.title}</h3>
                  <p className="mt-5 text-sm leading-8 text-neutral-600">{service.desc}</p>
                  <div className="mt-7 text-sm font-medium text-[#8a6a35] opacity-0 transition group-hover:opacity-100">顧問式統籌視角</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-[#8a6a35]">Process</div>
              <h2 className="mt-5 text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">合作流程</h2>
              <p className="mt-6 text-base leading-9 text-neutral-600 md:text-[17px]">
                以清楚階段與節點安排，讓初步接觸、案件評估與正式推進之間，形成穩定銜接。
              </p>
            </div>
            <div className="rounded-full border border-neutral-300 px-5 py-2 text-sm text-neutral-600">Structured Consultation Flow</div>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {process.map((item) => (
              <div key={item.step} className="relative overflow-hidden rounded-[2rem] border border-black/5 bg-white p-8 shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
                <div className="absolute right-5 top-4 text-6xl font-semibold tracking-tight text-neutral-100">{item.step}</div>
                <div className="relative">
                  <div className="text-[11px] font-medium uppercase tracking-[0.28em] text-neutral-500">Step {item.step}</div>
                  <div className="mt-5 text-2xl font-semibold tracking-tight text-neutral-950">{item.title}</div>
                  <p className="mt-5 text-sm leading-8 text-neutral-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#111827] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(181,152,99,0.22),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_26%)]" />
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
            <div className="relative z-10">
              <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-[#d0b27d]">Why San-Sce</div>
              <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
                當案件需要的，已經不只是單一建議，而是能持續推進的統籌架構。
              </h2>
              <p className="mt-8 max-w-3xl text-base leading-9 text-white/72 md:text-[17px]">
                自主更新真正考驗的，是地主整合、程序掌握、專業協作與資訊秩序。三策重視的，是讓案件在多方意見與長期推進之中，仍有可追蹤、可協調、可執行的工作方式。
              </p>
            </div>

            <div className="relative z-10 rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.22)] backdrop-blur-sm">
              <div className="text-[11px] uppercase tracking-[0.28em] text-white/45">Suitable Scenarios</div>
              <ul className="mt-8 space-y-4 text-sm leading-8 text-white/80">
                <li className="rounded-2xl border border-white/8 bg-white/5 px-5 py-4">基地已有更新構想，但缺乏清楚推動架構</li>
                <li className="rounded-2xl border border-white/8 bg-white/5 px-5 py-4">地主意見整合中，需要穩定而中立的專案窗口</li>
                <li className="rounded-2xl border border-white/8 bg-white/5 px-5 py-4">已接觸部分專業單位，但缺乏整體統籌與管理</li>
                <li className="rounded-2xl border border-white/8 bg-white/5 px-5 py-4">希望以地主端立場評估自主更新的可行方向</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-[#8a6a35]">Contact</div>
              <h2 className="mt-5 text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">預約初步諮詢</h2>
              <p className="mt-7 max-w-2xl text-base leading-9 text-neutral-600 md:text-[17px]">
                若您正評估自主更新案件，或希望先釐清基地條件、整合現況與合作方向，歡迎留下聯絡資訊。
              </p>

              <div className="mt-10 space-y-5 rounded-[2rem] border border-black/5 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-neutral-500">Company</div>
                  <div className="mt-2 text-base font-medium text-neutral-950">三策專案管理顧問有限公司</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-neutral-500">Service Scope</div>
                  <div className="mt-2 text-base text-neutral-700">自主更新全案管理・專案統籌・前期評估</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-neutral-500">Consultation</div>
                  <div className="mt-2 text-base text-neutral-700">可先提供基地位置、案件現況與主要問題，便於安排初步判讀。</div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-black/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,246,241,0.94))] p-8 shadow-[0_26px_70px_rgba(15,23,42,0.08)] md:p-10">
              <div className="grid gap-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">姓名</label>
                    <input className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 outline-none transition focus:border-neutral-500" placeholder="請輸入您的姓名" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">聯絡電話</label>
                    <input className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 outline-none transition focus:border-neutral-500" placeholder="請輸入您的聯絡電話" />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">基地位置</label>
                  <input className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 outline-none transition focus:border-neutral-500" placeholder="例如：新北市板橋區..." />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">需求簡述</label>
                  <textarea className="min-h-[150px] w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 outline-none transition focus:border-neutral-500" placeholder="請簡要說明案件現況、目前卡點與希望優先釐清的事項" />
                </div>
                <button className="mt-2 rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-medium text-white shadow-[0_18px_45px_rgba(17,24,39,0.18)] transition hover:-translate-y-0.5">
                  送出諮詢資料
                </button>
                <p className="text-xs leading-7 text-neutral-500">目前為視覺示意版本。正式上線時可串接 Google 表單、Typeform、Email API 或 CRM 系統。</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>© 2026 三策專案管理顧問有限公司 San-Sce Project Management Consulting</div>
          <div>自主更新全案管理・地主端專案統籌</div>
        </div>
      </footer>
    </div>
  )
}
