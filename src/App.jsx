import { QRCodeSVG } from "qrcode.react";

export default function SanzeWebsitePreview() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Georgia', 'Noto Serif TC', serif", backgroundColor: "#f7f9f8", color: "#2d3a35" }}>

      {/* Hero */}
      <section style={{
        background: "linear-gradient(135deg, #f6f4ef 0%, #f1f4f2 36%, #edf2f5 68%, #f4f2ee 100%)",
        color: "#2f3a38",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          opacity: 0.72,
          backgroundImage: "radial-gradient(circle at 14% 18%, rgba(206, 217, 210, 0.28) 0%, transparent 28%), radial-gradient(circle at 83% 20%, rgba(198, 212, 224, 0.26) 0%, transparent 26%), radial-gradient(circle at 74% 76%, rgba(215, 224, 214, 0.2) 0%, transparent 22%), radial-gradient(circle at 22% 82%, rgba(225, 217, 205, 0.18) 0%, transparent 20%)"
        }} />
        <div style={{
          position: "absolute",
          inset: 0,
          opacity: 0.22,
          background: "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 100%)"
        }} />
        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", padding: "3.2rem 2.2rem 2.7rem" }}>
          <div style={{ maxWidth: 760 }}>
            <p style={{ fontSize: "0.58rem", letterSpacing: "0.16em", color: "#8a9591", marginBottom: "0.62rem", fontFamily: "sans-serif" }}>
              SANZE PROJECT MANAGEMENT CONSULTING
            </p>
            <h1 style={{ fontSize: "clamp(1.28rem, 2.6vw, 2.1rem)", fontWeight: 700, lineHeight: 1.22, marginBottom: "0.7rem", letterSpacing: "0.01em", color: "#2f3a38" }}>
              三策專案管理顧問有限公司
            </h1>
            <p style={{ fontSize: "0.92rem", lineHeight: 1.72, color: "#66736f", marginBottom: "1.15rem", maxWidth: 560 }}>
              陪伴社區走過都市更新、危老重建與自主更新的每一步，讓繁瑣的程序變得清晰，讓重建的路走得更踏實。
            </p>
            <div style={{ display: "flex", gap: "0.62rem", flexWrap: "wrap" }}>
              <a href="#services" style={{
                background: "rgba(255,255,255,0.64)", color: "#52615c", padding: "0.56rem 1.08rem",
                borderRadius: "2rem", fontWeight: 700, fontSize: "0.8rem", textDecoration: "none",
                fontFamily: "sans-serif", border: "1px solid rgba(121,135,129,0.12)", boxShadow: "0 4px 14px rgba(140,150,148,0.06)", backdropFilter: "blur(6px)"
              }}>了解服務內容</a>
              <a href="#contact" style={{
                border: "1px solid rgba(121,135,129,0.16)", color: "#67746f", padding: "0.56rem 1.08rem",
                borderRadius: "2rem", fontWeight: 600, fontSize: "0.8rem", textDecoration: "none",
                fontFamily: "sans-serif", background: "rgba(255,255,255,0.34)", backdropFilter: "blur(6px)"
              }}>聯絡三策</a>
            </div>
          </div>
        </div>
      </section>

      {/* 3 cards */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "3.1rem 2.5rem 3.6rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {[
            {
              tag: "服務定位",
              title: "以全案管理思維，陪伴社區穩定推進",
              body: "三策重視的，是讓社區在推動過程中每一個環節都能被妥善承接，方向更清楚，執行也更有秩序。"
            },
            {
              tag: "適用對象",
              title: "適合正評估或已進入推動階段的社區",
              body: "無論是起步評估、住戶整合，或已進入程序推進階段，三策都可依案件節奏提供相應的顧問支援。"
            },
            {
              tag: "核心特色",
              title: "程序清楚，整合務實，溝通穩定",
              body: "我們用更貼近實務的方式整理資訊、協調資源與推進節點，讓社區少一點反覆摸索，多一分掌握。"
            }
          ].map((card, i) => (
            <div key={i} style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(252,252,251,0.92) 100%)",
              borderRadius: "1.4rem",
              padding: "1.45rem 1.45rem 1.5rem",
              boxShadow: "0 10px 30px rgba(140,155,150,0.08)",
              border: "1px solid rgba(180,198,191,0.38)",
              backdropFilter: "blur(6px)"
            }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#78948a", letterSpacing: "0.12em", fontFamily: "sans-serif", textTransform: "uppercase" }}>{card.tag}</p>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, lineHeight: 1.6, margin: "0.65rem 0 0.7rem", color: "#31413c" }}>{card.title}</h2>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.9, color: "#667a74" }}>{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" style={{ background: "#eef4f1", padding: "4rem 0" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 2.5rem" }}>
          <p style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.18em", color: "#3d7a62", fontFamily: "sans-serif" }}>SERVICES</p>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, margin: "0.6rem 0 1.8rem" }}>三策可以提供什麼</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", fontSize: "1.02rem", lineHeight: 2, color: "#4a6058" }}>
            <p>
              都市更新、危老重建與自主更新，涉及的面向往往比想像中廣——基地條件的判讀、住戶的整合溝通、推動組織的建立，以及建築、法律、估價、財務等專業資源的協調配合。三策希望做的，就是把這些原本零散而費力的事項整合起來，讓社區的每一步都走得有方向、有秩序。
            </p>
            <p>
              在前期，我們陪伴社區釐清基地現況、評估可行方向，理解在現有條件下真正需要面對的課題。當案件進入整合推動階段，我們協助建立溝通節奏、整理住戶意見，並視需要串聯各領域的專業夥伴，讓推動路徑具體而清晰。
            </p>
            <p>
              許多社區最真實的困境，不在於不知道有哪條路，而在於缺少一個能夠穩住節奏、整合資訊、持續推進的角色。這正是三策希望扮演的——一個務實、可信、能真正陪著走下去的顧問夥伴。
            </p>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section style={{ maxWidth: 820, margin: "0 auto", padding: "4rem 2.5rem" }}>
        <p style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.18em", color: "#3d7a62", fontFamily: "sans-serif" }}>WORKFLOW</p>
        <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, margin: "0.6rem 0 1.8rem" }}>推動需要的，是穩定的節奏</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", fontSize: "1.02rem", lineHeight: 2, color: "#4a6058" }}>
          <p>
            很多案件之所以停滯，往往不是條件不夠，而是在往前走的過程中，逐漸被資訊分散、意見落差與程序繁瑣所消耗。每一個環節之間若缺乏穩定的銜接，社區的能量很容易在反覆的等待與摸索中悄悄流失。
          </p>
          <p>
            三策理解，重建推動是一段需要時間、需要耐心的旅程。每一個階段都值得被好好整理，每一次溝通也都需要被穩妥承接。從釐清基地條件、整理可行方向，到凝聚社區共識、安排程序進度，真正重要的是讓事情一件一件往前走，而不是讓社區在繁複的資訊裡失去方向感。
          </p>
          <p>
            因此，三策重視的不只是提供建議，更是協助社區在整段推動過程中維持清楚而可持續的節奏。節奏穩了，共識更容易形成，程序更容易銜接，整體案件也更有機會踏實地走向可執行的未來。
          </p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" style={{
        background: "linear-gradient(135deg, #eef1ee 0%, #e8eded 42%, #e4eaee 100%)",
        padding: "4.5rem 0",
        color: "#2f3a38",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          opacity: 0.65,
          backgroundImage: "radial-gradient(circle at 18% 16%, rgba(206, 217, 210, 0.32) 0%, transparent 28%), radial-gradient(circle at 84% 26%, rgba(194, 208, 220, 0.28) 0%, transparent 26%), radial-gradient(circle at 72% 78%, rgba(214, 222, 214, 0.24) 0%, transparent 22%)"
        }} />
        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", padding: "0 2.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "3rem", alignItems: "start" }}>
            <div>
              <p style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.18em", color: "#7a8a84", fontFamily: "sans-serif" }}>CONTACT</p>
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, margin: "0.6rem 0 1rem", color: "#2f3a38" }}>歡迎與三策聯繫</h2>
              <p style={{ fontSize: "1rem", lineHeight: 1.9, color: "#66736f", maxWidth: 420 }}>
                若您正在思考都市更新、危老重建或自主更新的方向，歡迎先與我們聯繫，讓三策協助您釐清現況、理解下一步，再安排進一步的說明與討論。
              </p>
            </div>

            <div>
              <div style={{
                background: "linear-gradient(135deg, #23353d 0%, #1f3037 55%, #1b2a31 100%)",
                borderRadius: "2rem",
                padding: "2rem",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 18px 42px rgba(68,86,93,0.18)"
              }}>
                <h3 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "1.5rem", color: "#ffffff" }}>聯絡資訊</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", fontSize: "0.98rem", lineHeight: 1.8, color: "#d8e3e6" }}>
                  <div>
                    <p style={{ fontWeight: 700, color: "white" }}>公司名稱：三策專案管理顧問有限公司</p>
                    <p style={{ color: "#b8c8cf", fontSize: "0.88rem" }}>Sanze Project Management Consulting Co., Ltd.</p>
                  </div>
                  <p><span style={{ fontWeight: 700, color: "white" }}>服務電話：</span>0916711323</p>
                  <p>
                    <span style={{ fontWeight: 700, color: "white" }}>電子郵件：</span>
                    <a
                      href="mailto:sanze.consulting@gmail.com"
                      style={{ color: "#d8e3e6", textDecoration: "none" }}
                    >
                      sanze.consulting@gmail.com
                    </a>
                  </p>
                  <p><span style={{ fontWeight: 700, color: "white" }}>服務時間：</span>週一至週五 09:00－18:00</p>
                </div>

                <div style={{ marginTop: "1.8rem", textAlign: "center" }}>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem", color: "#ffffff" }}>官方 LINE</h4>
                  <p style={{ color: "#b8c8cf", fontSize: "0.9rem", marginBottom: "1rem" }}>LINE ID：@160rlvqj</p>
                  <div style={{ background: "white", borderRadius: "1rem", padding: "0.75rem", display: "inline-flex", boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }}>
                    <QRCodeSVG value="https://line.me/R/ti/p/@160rlvqj" size={110} bgColor="#ffffff" fgColor="#111111" includeMargin={true} />
                  </div>
                </div>

                <div style={{ marginTop: "1.4rem", textAlign: "center" }}>
                  <p style={{ color: "#d2dde1", fontSize: "0.9rem", lineHeight: 1.8, marginBottom: "1rem", maxWidth: 430, marginLeft: "auto", marginRight: "auto" }}>
                    掃描 QR code 或點擊下方按鈕，即可加入三策官方 LINE，作為主要聯絡與初步諮詢管道。
                  </p>
                  <a href="https://line.me/R/ti/p/@160rlvqj" target="_blank" rel="noreferrer" style={{
                    display: "inline-block", background: "#08c755", color: "white",
                    padding: "0.6rem 1.3rem", borderRadius: "2rem", fontWeight: 700,
                    fontSize: "0.9rem", textDecoration: "none", fontFamily: "sans-serif",
                    boxShadow: "0 10px 22px rgba(8,199,85,0.22)"
                  }}>加入 LINE 官方帳號</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
