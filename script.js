(function () {
  const form = document.getElementById("prakritiForm");
  const resultsEl = document.getElementById("results");
  const mainResult = document.getElementById("mainResult");
  const scoreSummary = document.getElementById("scoreSummary");
  const submitBtn = document.getElementById("submitBtn");
  const resetBtn = document.getElementById("resetBtn");
  const printBtn = document.getElementById("printBtn");

  document.querySelectorAll(".options").forEach((group) => {
    group.addEventListener("click", (e) => {
      const opt = e.target.closest("label.option");
      if (!opt) return;
      const radio = opt.querySelector("input[type=radio]");
      if (!radio) return;
      radio.checked = true;
      group.querySelectorAll(".option").forEach((o) => o.classList.remove("selected"));
      opt.classList.add("selected");
    });
  });

  function collectAnswers() {
    const data = {};
    form.querySelectorAll("input[type=radio]").forEach((i) => {
      if (i.checked) data[i.name] = i.value;
    });
    return data;
  }

  function computeScores(answers) {
    const scores = { vata: 0, pitta: 0, kapha: 0 };
    Object.values(answers).forEach((v) => {
      if (scores[v] !== undefined) scores[v]++;
    });
    return scores;
  }

  function determinePrakriti(scores) {
    const items = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [first, second, third] = items;
    const topDiff = first[1] - second[1];

    if (first[1] === second[1] && second[1] === third[1])
      return { type: "Tri-doshic", doshas: ["vata", "pitta", "kapha"], scores };

    if (topDiff >= 2) return { type: "Dominant", doshas: [first[0]], scores };

    if (topDiff <= 1) return { type: "Mixed", doshas: [first[0], second[0]], scores };

    return { type: "Dominant", doshas: [first[0]], scores };
  }

  function prettyDoshaName(d) {
    return d.charAt(0).toUpperCase() + d.slice(1);
  }

  function recommendationsFor(doshaArray) {
    if (doshaArray.length === 3) {
      return {
        title: "Tri-doshic (Balanced)",
        text:
          "Your constitution shows balance among Vata, Pitta, and Kapha.\n• Eat warm, seasonal foods.\n• Maintain regular routines.\n• Practice gentle yoga & meditation.\n• Avoid extremes in temperature or food.",
      };
    }

    if (doshaArray.length === 2) {
      const combo = doshaArray.sort().join("-");
      const mixes = {
        "vata-pitta":
          "Mixed Vata–Pitta:\n• Warm, nourishing, lightly spiced meals.\n• Avoid very spicy or very cold foods.\n• Calm evenings, regular routine.\n• Cooling pranayama & meditation.",
        "pitta-kapha":
          "Mixed Pitta–Kapha:\n• Light, warm, astringent diet.\n• Exercise regularly, avoid heavy oily foods.\n• Cooling herbs like turmeric or coriander.",
        "kapha-vata":
          "Mixed Kapha–Vata:\n• Warm, cooked, light meals.\n• Avoid heavy sweets.\n• Gentle daily movement and grounding breathwork.",
      };
      return { title: "Mixed Constitution", text: mixes[combo] };
    }

    const single = doshaArray[0];
    const texts = {
      vata:
        "Vata dominant:\n• Eat warm, oily, grounding foods.\n• Keep consistent routine.\n• Avoid cold & dry conditions.\n• Gentle yoga, meditation, adequate rest.",
      pitta:
        "Pitta dominant:\n• Cooling diet (avoid spicy/oily foods).\n• Stay hydrated.\n• Avoid overheating and stress.\n• Practice calming yoga & deep breathing.",
      kapha:
        "Kapha dominant:\n• Light, warm, slightly spicy diet.\n• Active lifestyle.\n• Reduce sugar and dairy.\n• Energizing breathwork and cardio.",
    };
    return { title: prettyDoshaName(single) + " Recommendations", text: texts[single] };
  }

  function renderResults(pr) {
    const s = pr.scores;
    scoreSummary.innerHTML = `
      <span class="score-pill">Vata: ${s.vata}</span>
      <span class="score-pill">Pitta: ${s.pitta}</span>
      <span class="score-pill">Kapha: ${s.kapha}</span>
    `;

    let heading = "";
    if (pr.type === "Tri-doshic") heading = "<h3>Tri-doshic (Balanced)</h3>";
    else if (pr.type === "Mixed")
      heading = `<h3>${prettyDoshaName(pr.doshas[0])}-${prettyDoshaName(pr.doshas[1])} (Mixed)</h3>`;
    else heading = `<h3>${prettyDoshaName(pr.doshas[0])}-dominant</h3>`;

    const rec = recommendationsFor(pr.doshas);
    mainResult.innerHTML = `
      ${heading}
      <div class="dosha-card">
        <strong>${rec.title}</strong><br>
        <pre class="small">${rec.text}</pre>
      </div>
    `;
  }

  submitBtn.addEventListener("click", () => {
    const answers = collectAnswers();
    const required = ["skin","build","hair","eyes","mindset","memory","emotions","diet","sleep","energy","climate","stress"];
    const missing = required.filter((q) => !(q in answers));
    if (missing.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    const pr = determinePrakriti(computeScores(answers));
    renderResults(pr);
    resultsEl.style.display = "block";
    resultsEl.scrollIntoView({ behavior: "smooth" });
  });

  resetBtn.addEventListener("click", () => {
    form.reset();
    document.querySelectorAll(".option.selected").forEach((o) => o.classList.remove("selected"));
    resultsEl.style.display = "none";
    scoreSummary.innerHTML = "";
    mainResult.innerHTML = "";
  });

  printBtn.addEventListener("click", () => window.print());
})();
