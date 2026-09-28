// export const limits = {first_name:100,last_name:100,email:254,phone:25,subject:200,message:5000};
// export function validate(input) {
//   const fields = {};
//   for (const [key,max] of Object.entries(limits)) {
//     if (typeof input?.[key] !== 'string') return {error:`Invalid ${key}.`};
//     fields[key] = input[key].trim();
//     if ([...fields[key]].length > max) return {error:`${key} is too long.`};
//   }
//   for (const key of ['first_name','last_name','email','phone']) {
//     if (!fields[key]) return {error:`${key} is required.`};
//   }
//   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) return {error:'Invalid email address.'};
//   if (!/^[+0-9()\- .]{6,25}$/.test(fields.phone)) return {error:'Invalid phone number.'};
//   return {fields};
// }
// const escapeHtml = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// export function contactEmailHtml(f) {
//   const rows = [['First name',f.first_name],['Last name',f.last_name],['Email',f.email],['Phone',f.phone],['Subject',f.subject || '(not provided)']];
//   const cells = rows.map(([k,v])=>`<tr><td style="padding:12px;border-bottom:1px solid #eee;color:#666;width:120px">${escapeHtml(k)}</td><td style="padding:12px;border-bottom:1px solid #eee">${escapeHtml(v)}</td></tr>`).join('');
//   const message = escapeHtml(f.message || '(not provided)').replace(/\r?\n/g,'<br>');
//   return `<!doctype html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:28px;background:#f5f5f5;font-family:Arial,sans-serif;color:#222"><div style="max-width:620px;margin:auto;background:white;border-radius:12px;overflow:hidden"><div style="background:#191919;color:white;padding:24px"><h1 style="margin:0;font-size:22px">New contact form submission</h1></div><div style="padding:24px"><table style="width:100%;border-collapse:collapse;font-size:14px">${cells}</table><h2 style="font-size:16px;margin-top:28px">Message</h2><div style="padding:16px;background:#fafafa;border:1px solid #eee;border-radius:8px;line-height:1.6;overflow-wrap:anywhere">${message}</div></div></div></body></html>`;
// }

export const limits = {
  first_name: 100,
  last_name: 100,
  email: 254,
  phone: 25,
  subject: 200,
  message: 5000,
};

export function validate(input) {
  const fields = {};

  for (const [key, max] of Object.entries(limits)) {
    const value = input?.[key];

    // Subject and message are optional
    if (
      (key === "subject" || key === "message") &&
      (value === undefined || value === null)
    ) {
      fields[key] = "";
      continue;
    }

    if (typeof value !== "string") {
      return { error: `Invalid ${key}.` };
    }

    fields[key] = value.trim();

    if ([...fields[key]].length > max) {
      return { error: `${key} is too long.` };
    }
  }

  for (const key of ["first_name", "last_name", "email", "phone"]) {
    if (!fields[key]) {
      return { error: `${key} is required.` };
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    return { error: "Invalid email address." };
  }

  if (!/^[+0-9()\- .]{6,25}$/.test(fields.phone)) {
    return { error: "Invalid phone number." };
  }

  return { fields };
}

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );

export function contactEmailHtml(f) {
  const rows = [
    ["First name", f.first_name],
    ["Last name", f.last_name],
    ["Email", f.email],
    ["Phone", f.phone],
    ["Subject", f.subject || "(not provided)"],
  ];

  const cells = rows
    .map(
      ([key, value]) => `
            <tr>
                <td style="padding:12px;border-bottom:1px solid #eee;color:#666;width:120px">
                    ${escapeHtml(key)}
                </td>
                <td style="padding:12px;border-bottom:1px solid #eee">
                    ${escapeHtml(value)}
                </td>
            </tr>
        `,
    )
    .join("");

  const message = escapeHtml(f.message || "(not provided)").replace(
    /\r?\n/g,
    "<br>",
  );

  return `
<!doctype html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="margin:0;padding:28px;background:#f5f5f5;font-family:Arial,sans-serif;color:#222">
    <div style="max-width:620px;margin:auto;background:white;border-radius:12px;overflow:hidden">
        <div style="background:#191919;color:white;padding:24px">
            <h1 style="margin:0;font-size:22px">
                New contact form submission
            </h1>
        </div>

        <div style="padding:24px">
            <table style="width:100%;border-collapse:collapse;font-size:14px">
                ${cells}
            </table>

            <h2 style="font-size:16px;margin-top:28px">
                Message
            </h2>

            <div style="padding:16px;background:#fafafa;border:1px solid #eee;border-radius:8px;line-height:1.6;overflow-wrap:anywhere">
                ${message}
            </div>
        </div>
    </div>
</body>
</html>`;
}
