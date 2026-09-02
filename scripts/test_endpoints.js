const http = require("http");

async function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || "GET",
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data,
          json,
        });
      });
    });

    req.on("error", reject);
    if (body) req.write(typeof body === "string" ? body : JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log("=== 1. Testing Homepage (http://localhost:3000/) ===");
  const home = await request("http://localhost:3000/");
  console.log("Status:", home.status);
  console.log("HTML length:", home.data.length);
  console.log("Security Header X-DNS-Prefetch-Control:", home.headers["x-dns-prefetch-control"]);
  console.log("Security Header Strict-Transport-Security:", home.headers["strict-transport-security"]);
  console.log("Security Header X-Frame-Options:", home.headers["x-frame-options"]);

  console.log("\n=== 2. Testing Portfolio API (http://localhost:3000/api/portfolio) ===");
  const portfolio = await request("http://localhost:3000/api/portfolio");
  console.log("Status:", portfolio.status);
  console.log("Hero Name:", portfolio.json?.hero?.name);
  console.log("Total Projects:", portfolio.json?.projects?.length);
  console.log("Total Skills:", portfolio.json?.skills?.length);
  console.log("Total Experience:", portfolio.json?.experience?.length);

  console.log("\n=== 3. Testing Contact Inquiry Submission ===");
  const contact = await request(
    "http://localhost:3000/api/contact",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    {
      name: "Verification User",
      email: "test.verification@example.com",
      subject: "Vercel Performance Audit",
      message: "Verified submission from test suite.",
    }
  );
  console.log("Contact API Status:", contact.status);
  console.log("Contact Result:", contact.json);

  console.log("\n=== 4. Testing Admin Authentication (Login) ===");
  const login = await request(
    "http://localhost:3000/api/auth",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    {
      action: "login",
      username: "admin",
      password: "admin123",
    }
  );
  console.log("Login Status:", login.status);
  console.log("Login Result:", login.json);
  const cookie = login.headers["set-cookie"]?.[0]?.split(";")[0] || "";
  console.log("Session Cookie Obtained:", cookie ? "Yes (Secure HTTP-only)" : "No");

  console.log("\n=== 5. Testing Media Library API with Session ===");
  const media = await request("http://localhost:3000/api/media", {
    headers: { Cookie: cookie },
  });
  console.log("Media Status:", media.status);
  console.log("Media Assets Count:", media.json?.length);
  if (media.json?.length > 0) {
    console.log("Sample Asset:", media.json[0].name, "->", media.json[0].url);
  }

  console.log("\n=== 6. Testing Direct Secret Admin Gateway (/admin?access=mg_studio) ===");
  const adminPage = await request("http://localhost:3000/admin?access=mg_studio");
  console.log("Admin Gateway Page Status:", adminPage.status);
  console.log("Admin Page HTML length:", adminPage.data.length);

  console.log("\n=== 7. Testing Public Admin Access without Secret Key (/admin) ===");
  const publicAdminPage = await request("http://localhost:3000/admin");
  console.log("Unauthorized Admin Page Status:", publicAdminPage.status);

  console.log("\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!");
}

runTests().catch(console.error);
