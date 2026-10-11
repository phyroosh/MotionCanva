import fs from 'fs';
import path from 'path';

const uiMainPath = path.resolve('node_modules/@motion-canvas/ui/dist/main.js');

if (fs.existsSync(uiMainPath)) {
  let content = fs.readFileSync(uiMainPath, 'utf8');

  // Export button snippet
  const exportButtonSnippet = `, u("button", {
      id: "export-rightclips-btn",
      title: "Export rendered video & viral metadata to RightClips Studio",
      style: "background: #10b981; color: white; border: none; border-radius: 4px; padding: 2px 10px; font-weight: 700; cursor: pointer; font-size: 11px; margin-left: 6px; height: 24px; display: inline-flex; align-items: center; justify-content: center; letter-spacing: 0.5px; transition: all 0.2s;",
      onClick: async () => {
        const btn = document.getElementById("export-rightclips-btn");
        if (btn) btn.innerText = "EXPORTING...";
        try {
          const res = await fetch("/api/export-rightclips", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug: r?.name || "" })
          });
          const data = await res.json();
          if (data.success) {
            if (btn) {
              btn.innerText = "SYNCED ✅";
              btn.style.background = "#059669";
              setTimeout(() => {
                btn.innerText = "EXPORT TO RIGHTCLIPS";
                btn.style.background = "#10b981";
              }, 3000);
            }
          } else {
            alert(data.error || "Export failed");
            if (btn) btn.innerText = "EXPORT TO RIGHTCLIPS";
          }
        } catch (err) {
          alert("Export failed: " + err.message);
          if (btn) btn.innerText = "EXPORT TO RIGHTCLIPS";
        }
      },
      children: "EXPORT TO RIGHTCLIPS"
    })`;

  // Case 1: If neither button is present, inject both
  if (!content.includes('id: "render-toolbar-btn"')) {
    const closePattern = 'children: u(FO, {})\n    })]';
    if (content.includes(closePattern)) {
      const renderButton = `, u("button", {
      id: "render-toolbar-btn",
      title: "Render video to out/ folder via FFmpeg",
      style: \`background: \${cc() === 1 ? "#ef4444" : "#6366f1"}; color: white; border: none; border-radius: 4px; padding: 2px 14px; font-weight: 700; cursor: pointer; font-size: 11px; margin-left: 8px; height: 24px; display: inline-flex; align-items: center; justify-content: center; letter-spacing: 1px; transition: background 0.2s;\`,
      onClick: () => {
        cc() === 1 ? e.abort() : e.render({
          ...n.getFullRenderingSettings(),
          name: r.name
        });
      },
      children: cc() === 1 ? "ABORT" : "RENDER"
    })${exportButtonSnippet}]`;
      content = content.replace(closePattern, `children: u(FO, {})\n    })${renderButton}`);
      fs.writeFileSync(uiMainPath, content, 'utf8');
      console.log('✅ Injected RENDER and EXPORT TO RIGHTCLIPS buttons into Motion Canvas UI');
    }
  } else if (!content.includes('id: "export-rightclips-btn"')) {
    // Case 2: Render button is present, inject Export button next to it
    const renderEndPattern = 'children: cc() === 1 ? "ABORT" : "RENDER"\n    })]';
    if (content.includes(renderEndPattern)) {
      content = content.replace(
        renderEndPattern,
        `children: cc() === 1 ? "ABORT" : "RENDER"\n    })${exportButtonSnippet}]`
      );
      fs.writeFileSync(uiMainPath, content, 'utf8');
      console.log('✅ Injected EXPORT TO RIGHTCLIPS button alongside RENDER button');
    }
  } else {
    console.log('ℹ️  Both RENDER and EXPORT TO RIGHTCLIPS buttons are active in Motion Canvas UI');
  }
}
