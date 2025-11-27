// // src/App.jsx
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Link,
//   useNavigate,
// } from "react-router-dom";

// // Cloudinary credentials (from you)
// const CLOUD_NAME = "dbq5gkepx";
// const UPLOAD_PRESET = "images-zozac";
// const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;

// // Backend endpoint
// const API_BASE = "https://faap.onrender.com/api/request";

// /* ---------- small toast hook ---------- */
// function useToast() {
//   const [toasts, setToasts] = useState([]);
//   useEffect(() => {
//     if (!toasts.length) return;
//     const t = setTimeout(() => setToasts((s) => s.slice(1)), 3500);
//     return () => clearTimeout(t);
//   }, [toasts]);
//   const push = (text, type = "info") =>
//     setToasts((s) => [...s, { id: Date.now(), text, type }]);
//   const Toasts = () => (
//     <div className="fixed top-6 right-6 z-50 space-y-2">
//       {toasts.map((t) => (
//         <div
//           key={t.id}
//           className={`rounded-md px-4 py-2 shadow ${t.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
//             }`}
//         >
//           {t.text}
//         </div>
//       ))}
//     </div>
//   );
//   return { push, Toasts };
// }

// /* ---------- Cloudinary upload helper ---------- */
// async function uploadToCloudinary(file, onProgress) {
//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("upload_preset", UPLOAD_PRESET);

//   const res = await axios.post(CLOUDINARY_UPLOAD_URL, formData, {
//     onUploadProgress: (e) => {
//       if (onProgress && e.total) {
//         const pct = Math.round((e.loaded / e.total) * 100);
//         onProgress(pct);
//       }
//     },
//   });

//   return res.data; // contains secure_url, public_id, etc.
// }

// /* ---------- Main App ---------- */
// export default function App() {
//   return (
//     <Router>
//       <div className="min-h-screen bg-gray-50 text-gray-800">
//         <header className="bg-white shadow-sm">
//           <div className="container mx-auto px-4 py-4 flex items-center justify-between">
//             <h1 className="text-2xl font-semibold">Candidate Requests</h1>
//             <nav className="space-x-3">
//               <Link to="/" className="px-3 py-2 rounded-md hover:bg-gray-100">
//                 Submit
//               </Link>
//               <Link to="/admin" className="px-3 py-2 rounded-md hover:bg-gray-100">
//                 Admin
//               </Link>
//             </nav>
//           </div>
//         </header>

//         <main className="container mx-auto px-4 py-8">
//           <Routes>
//             <Route path="/" element={<RequestForm />} />
//             <Route path="/admin" element={<AdminPanel />} />
//           </Routes>
//         </main>


//       </div>
//     </Router>
//   );
// }

// /* ---------- Request Form (uploads images to Cloudinary) ---------- */
// function RequestForm() {
//   const { push, Toasts } = (() => {
//     const t = useToast();
//     return t;
//   })();
//   const [form, setForm] = useState({
//     name: "",
//     manifesto: "",
//     photo: "", // Cloudinary URL
//     color: "#2563eb",
//     colorIndex: 0,
//     bg: "", // Cloudinary URL
//     email: "",
//     approved: false,
//     aboutyourteam: [{ memberName: "", memberRole: "", Info: "", memberPhoto: "" }],
//   });
//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState({}); // e.g. { 'photo': 56, 'aboutyourteam.0.memberPhoto': 80 }

//   function updateTeamMember(idx, key, value) {
//     setForm((f) => {
//       const newTeam = f.aboutyourteam.map((m, i) => (i === idx ? { ...m, [key]: value } : m));
//       return { ...f, aboutyourteam: newTeam };
//     });
//   }

//   function addTeamMember() {
//     setForm((f) => ({
//       ...f,
//       aboutyourteam: [...f.aboutyourteam, { memberName: "", memberRole: "", Info: "", memberPhoto: "" }],
//     }));
//   }

//   function removeTeamMember(idx) {
//     setForm((f) => ({ ...f, aboutyourteam: f.aboutyourteam.filter((_, i) => i !== idx) }));
//   }

//   function validate() {
//     const { name, manifesto, photo, color, colorIndex, bg, email, aboutyourteam } = form;
//     if (!name || !manifesto || !photo || !color || colorIndex == null || !bg || !email)
//       return "All top-level fields are required (make sure images are uploaded).";
//     if (!aboutyourteam || aboutyourteam.length === 0) return "At least one team member is required.";
//     for (const [i, m] of aboutyourteam.entries()) {
//       if (!m.memberName || !m.memberRole || !m.Info || !m.memberPhoto)
//         return `All fields required for team member #${i + 1} (make sure member photos are uploaded).`;
//     }
//     if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Please enter a valid email address.";
//     if (manifesto.length > 500) return "Manifesto must be 500 characters or fewer.";
//     return null;
//   }

//   async function handleFileInputChange(e, fieldPath) {
//     // fieldPath examples: 'photo' or 'aboutyourteam.0.memberPhoto' or 'bg'
//     const file = e.target.files?.[0];
//     if (!file) return;
//     try {
//       setUploading((u) => ({ ...u, [fieldPath]: 0 }));
//       const data = await uploadToCloudinary(file, (pct) => setUploading((u) => ({ ...u, [fieldPath]: pct })));
//       const url = data.secure_url || data.url;
//       if (fieldPath === "photo") {
//         setForm((f) => ({ ...f, photo: url }));
//       } else if (fieldPath === "bg") {
//         setForm((f) => ({ ...f, bg: url }));
//       } else if (fieldPath.startsWith("aboutyourteam")) {
//         const parts = fieldPath.split("."); // [aboutyourteam, idx, memberPhoto]
//         const idx = Number(parts[1]);
//         const key = parts[2];
//         setForm((f) => {
//           const newTeam = f.aboutyourteam.map((m, i) => (i === idx ? { ...m, [key]: url } : m));
//           return { ...f, aboutyourteam: newTeam };
//         });
//       }
//       push("Image uploaded");
//     } catch (err) {
//       console.error("Upload error", err?.response || err.message);
//       push("Failed to upload image", "error");
//     } finally {
//       setUploading((u) => ({ ...u, [fieldPath]: undefined }));
//     }
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     const err = validate();
//     if (err) {
//       push(err, "error");
//       return;
//     }
//     setLoading(true);
//     try {
//       const payload = { ...form, colorIndex: Number(form.colorIndex || 0) };
//       await axios.post(API_BASE, payload, { headers: { "Content-Type": "application/json" } });
//       push("Request placed successfully");
//       setForm({
//         name: "",
//         manifesto: "",
//         photo: "",
//         color: "#2563eb",
//         colorIndex: 0,
//         bg: "",
//         email: "",
//         approved: false,
//         aboutyourteam: [{ memberName: "", memberRole: "", Info: "", memberPhoto: "" }],
//       });
//     } catch (err) {
//       console.error(err?.response?.data || err.message);
//       push(err?.response?.data?.message || "Failed to place request", "error");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-6">
//       <Toasts />
//       <h2 className="text-xl font-semibold mb-4">Submit Request to be Candidate</h2>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <label className="space-y-1">
//             <span className="text-sm font-medium">Full name</span>
//             <input
//               value={form.name}
//               onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
//               className="w-full rounded-md border px-3 py-2"
//               placeholder="Jane Doe"
//             />
//           </label>

//           <label className="space-y-1">
//             <span className="text-sm font-medium">Email</span>
//             <input
//               value={form.email}
//               onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
//               className="w-full rounded-md border px-3 py-2"
//               placeholder="jane@example.com"
//             />
//           </label>
//         </div>

//         <label className="space-y-1">
//           <span className="text-sm font-medium">Manifesto (max 500 chars)</span>
//           <textarea
//             value={form.manifesto}
//             onChange={(e) => setForm((f) => ({ ...f, manifesto: e.target.value }))}
//             className="w-full rounded-md border px-3 py-2 h-28"
//             placeholder="What you stand for..."
//           />
//           <div className="text-xs text-gray-500">{form.manifesto.length}/500</div>
//         </label>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <label className="space-y-1">
//             <span className="text-sm font-medium">Photo (upload)</span>
//             <input type="file" accept="image/*" onChange={(e) => handleFileInputChange(e, "photo")} className="w-full" />
//             {uploading["photo"] !== undefined && <div className="text-xs text-gray-500">Uploading: {uploading["photo"]}%</div>}
//             {form.photo && <img src={form.photo} alt="candidate" className="w-full h-32 object-cover mt-2 rounded" />}
//           </label>

//           <label className="space-y-1">
//             <span className="text-sm font-medium">Background (upload)</span>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={(e) => handleFileInputChange(e, "bg")}
//               className="w-full"
//             />
//             {uploading["bg"] !== undefined && <div className="text-xs text-gray-500">Uploading: {uploading["bg"]}%</div>}
//             {form.bg && <img src={form.bg} alt="background" className="w-full h-32 object-cover mt-2 rounded" />}
//           </label>

//           <label className="space-y-1">
//             <span className="text-sm font-medium">Accent color</span>
//             <div className="flex items-center gap-2">
//               <input
//                 type="color"
//                 value={form.color}
//                 onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
//                 className="w-12 h-10 p-0 border-0"
//               />
//               <input
//                 type="number"
//                 value={form.colorIndex}
//                 onChange={(e) => setForm((f) => ({ ...f, colorIndex: e.target.value }))}
//                 className="rounded-md border px-3 py-2 w-full"
//               />
//             </div>
//           </label>
//         </div>

//         <div>
//           <h3 className="text-lg font-medium mb-2">About your team</h3>
//           <div className="space-y-4">
//             {form.aboutyourteam.map((member, idx) => (
//               <div key={idx} className="p-4 border rounded-lg grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
//                 <div className="md:col-span-2">
//                   <input
//                     placeholder="Member name"
//                     value={member.memberName}
//                     onChange={(e) => updateTeamMember(idx, "memberName", e.target.value)}
//                     className="w-full rounded-md border px-3 py-2"
//                   />
//                 </div>

//                 <div className="md:col-span-1">
//                   <input
//                     placeholder="Role"
//                     value={member.memberRole}
//                     onChange={(e) => updateTeamMember(idx, "memberRole", e.target.value)}
//                     className="w-full rounded-md border px-3 py-2"
//                   />
//                 </div>

//                 <div className="md:col-span-1">
//                   <input
//                     placeholder="Photo (uploaded)"
//                     value={member.memberPhoto}
//                     readOnly
//                     className="w-full rounded-md border px-3 py-2 bg-gray-50"
//                   />
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => handleFileInputChange(e, `aboutyourteam.${idx}.memberPhoto`)}
//                     className="w-full mt-2"
//                   />
//                   {uploading[`aboutyourteam.${idx}.memberPhoto`] !== undefined && (
//                     <div className="text-xs text-gray-500">
//                       Uploading: {uploading[`aboutyourteam.${idx}.memberPhoto`]}%
//                     </div>
//                   )}
//                   {member.memberPhoto && <img src={member.memberPhoto} alt="member" className="w-full h-20 object-cover mt-2 rounded" />}
//                 </div>

//                 <div className="md:col-span-1 flex flex-col gap-2">
//                   <textarea
//                     placeholder="Short info"
//                     value={member.Info}
//                     onChange={(e) => updateTeamMember(idx, "Info", e.target.value)}
//                     className="w-full rounded-md border px-3 py-2 h-20"
//                   />
//                   <div className="flex gap-2 justify-end">
//                     {form.aboutyourteam.length > 1 && (
//                       <button type="button" onClick={() => removeTeamMember(idx)} className="text-sm text-red-600">
//                         Remove
//                       </button>
//                     )}
//                     {idx === form.aboutyourteam.length - 1 && (
//                       <button type="button" onClick={addTeamMember} className="text-sm text-blue-600">
//                         Add member
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="flex items-center gap-4">
//           <button disabled={loading} type="submit" className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 disabled:opacity-60">
//             {loading ? "Submitting..." : "Submit Request"}
//           </button>

//           <button
//             type="button"
//             onClick={() =>
//               setForm({
//                 name: "",
//                 manifesto: "",
//                 photo: "",
//                 color: "#2563eb",
//                 colorIndex: 0,
//                 bg: "",
//                 email: "",
//                 approved: false,
//                 aboutyourteam: [{ memberName: "", memberRole: "", Info: "", memberPhoto: "" }],
//               })
//             }
//             className="px-4 py-2 rounded-md border"
//           >
//             Clear
//           </button>
//         </div>

//         {/* Preview */}
//         <div className="pt-4">
//           <h4 className="font-medium">Preview</h4>
//           <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="col-span-1 rounded-md overflow-hidden border">
//               {form.photo ? (
//                 <img
//                   src={form.photo}
//                   alt="candidate photo"
//                   className="w-full h-44 object-cover"
//                   onError={(e) => {
//                     e.target.src =
//                       "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%2272%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23eee%22/%3E%3C/svg%3E";
//                   }}
//                 />
//               ) : (
//                 <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-400">No photo</div>
//               )}
//             </div>

//             <div className="col-span-2 p-3 rounded-md border">
//               <div className="flex items-center justify-between">
//                 <h5 className="font-semibold">{form.name || "Your name"}</h5>
//                 <div className="rounded-md px-3 py-1 text-sm" style={{ background: form.color, color: "#fff" }}>
//                   {form.colorIndex}
//                 </div>
//               </div>
//               <p className="mt-2 text-sm text-gray-600">{form.manifesto || "Your manifesto preview will appear here."}</p>
//             </div>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// }

// /* ---------- Admin Panel ---------- */
// function AdminPanel() {
//   const { push, Toasts } = (() => {
//     const t = useToast();
//     return t;
//   })();
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);

//   async function fetchRequests() {
//     setLoading(true);
//     try {
//       const res = await axios.get(API_BASE);
//       setRequests(res.data.request || []);
//     } catch (err) {
//       console.error(err?.response?.data || err.message);
//       push("Failed to fetch requests", "error");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     fetchRequests();
//   }, []);

//   return (
//     <div>
//       <Toasts />
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-xl font-semibold">All Requests</h2>
//         <div className="flex gap-2">
//           <button onClick={fetchRequests} className="px-3 py-2 rounded-md border">
//             Refresh
//           </button>
//         </div>
//       </div>

//       {loading ? (
//         <div className="text-center py-12">Loading...</div>
//       ) : requests.length === 0 ? (
//         <div className="text-center py-12 text-gray-500">No requests found.</div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {requests.map((r) => (
//             <CandidateCard key={r._id} request={r} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// /* ---------- Candidate Card ---------- */
// function CandidateCard({ request }) {
//   const [expanded, setExpanded] = useState(false);

//   return (
//     <div className="bg-white rounded-2xl shadow-sm overflow-hidden border">
//       <div className="h-40 overflow-hidden relative">
//         {request.bg ? <img src={request.bg} alt="background" className="w-full h-40 object-cover" /> : <div className="w-full h-40 bg-gray-100" />}
//         <div className="absolute left-4 bottom-[-28px]">
//           <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white shadow">
//             {request.photo ? <img src={request.photo} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
//           </div>
//         </div>
//       </div>

//       <div className="pt-8 p-4">
//         <div className="flex items-center justify-between">
//           <div>
//             <h3 className="text-lg font-semibold">{request.name}</h3>
//             <div className="text-sm text-gray-500">{request.email}</div>
//           </div>
//           <div className="text-right">
//             <div className="text-sm font-medium" style={{ color: request.color || "#111" }}>
//               {request.colorIndex}
//             </div>
//             <div className="text-xs text-gray-400">{new Date(request.createdAt).toLocaleString()}</div>
//           </div>
//         </div>

//         <p className="mt-3 text-sm text-gray-700">{request.manifesto}</p>

//         <div className="mt-4 flex items-center justify-between">
//           <div className="flex gap-2">
//             <button onClick={() => setExpanded((s) => !s)} className="px-3 py-1 rounded-md border text-sm">
//               {expanded ? "Collapse" : "Details"}
//             </button>
//           </div>
//           <div>
//             <span className={`px-2 py-1 rounded-full text-sm ${request.approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
//               {request.approved ? "Approved" : "Pending"}
//             </span>
//           </div>
//         </div>

//         {expanded && (
//           <div className="mt-4 border-t pt-4 space-y-3">
//             <div>
//               <h4 className="font-semibold">Team</h4>
//               <div className="mt-2 space-y-2">
//                 {request.aboutyourteam.map((m, i) => (
//                   <div key={i} className="flex items-center gap-3">
//                     <div className="w-12 h-12 rounded overflow-hidden bg-gray-100">{m.memberPhoto ? <img src={m.memberPhoto} alt="member" className="w-full h-full object-cover" /> : null}</div>
//                     <div>
//                       <div className="text-sm font-medium">{m.memberName}</div>
//                       <div className="text-xs text-gray-500">{m.memberRole}</div>
//                       <div className="text-xs text-gray-600">{m.Info}</div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <h4 className="font-semibold">Contact</h4>
//               <div className="text-sm text-gray-600">{request.email}</div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }














// src/App.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";

// Cloudinary credentials
const CLOUD_NAME = "dbq5gkepx";
const UPLOAD_PRESET = "images-zozac";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;

// Backend endpoint
const API_BASE = "https://faap.onrender.com/api/request";

/* ---------- small toast hook ---------- */
function useToast() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    if (!toasts.length) return;
    const t = setTimeout(() => setToasts((s) => s.slice(1)), 3500);
    return () => clearTimeout(t);
  }, [toasts]);
  const push = (text, type = "info") =>
    setToasts((s) => [...s, { id: Date.now(), text, type }]);
  const Toasts = () => (
    <div className="fixed top-6 right-6 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-md px-4 py-2 shadow ${t.type === "error"
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
            }`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
  return { push, Toasts };
}

/* ---------- Cloudinary upload helper ---------- */
async function uploadToCloudinary(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await axios.post(CLOUDINARY_UPLOAD_URL, formData, {
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct);
      }
    },
  });

  return res.data; // contains secure_url, public_id, etc.
}

/* ---------- Main App ---------- */
export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Candidate Requests</h1>
            <nav className="space-x-3">
              <Link
                to="/"
                className="px-3 py-2 rounded-md hover:bg-gray-100"
              >
                Submit
              </Link>
              <Link
                to="/admin"
                className="px-3 py-2 rounded-md hover:bg-gray-100"
              >
                Admin
              </Link>
            </nav>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<RequestForm />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

/* ---------- Request Form ---------- */
function RequestForm() {
  const { push, Toasts } = useToast();
  const [form, setForm] = useState({
    name: "",
    manifesto: "",
    photo: "",
    color: "#2563eb",
    colorIndex: 0,
    bg: "",
    email: "",
    approved: false,
    aboutyourteam: [{ memberName: "", memberRole: "", Info: "", memberPhoto: "" }],
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({});

  function updateTeamMember(idx, key, value) {
    setForm((f) => {
      const newTeam = f.aboutyourteam.map((m, i) =>
        i === idx ? { ...m, [key]: value } : m
      );
      return { ...f, aboutyourteam: newTeam };
    });
  }

  function addTeamMember() {
    setForm((f) => ({
      ...f,
      aboutyourteam: [
        ...f.aboutyourteam,
        { memberName: "", memberRole: "", Info: "", memberPhoto: "" },
      ],
    }));
  }

  function removeTeamMember(idx) {
    setForm((f) => ({
      ...f,
      aboutyourteam: f.aboutyourteam.filter((_, i) => i !== idx),
    }));
  }

  function validate() {
    const { name, manifesto, photo, color, colorIndex, bg, email, aboutyourteam } = form;
    if (!name || !manifesto || !photo || !color || colorIndex == null || !bg || !email)
      return "All top-level fields are required (make sure images are uploaded).";
    if (!aboutyourteam || aboutyourteam.length === 0) return "At least one team member is required.";
    for (const [i, m] of aboutyourteam.entries()) {
      if (!m.memberName || !m.memberRole || !m.Info || !m.memberPhoto)
        return `All fields required for team member #${i + 1} (make sure member photos are uploaded).`;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Please enter a valid email address.";
    if (manifesto.length > 500) return "Manifesto must be 500 characters or fewer.";
    return null;
  }

  async function handleFileInputChange(e, fieldPath) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading((u) => ({ ...u, [fieldPath]: 0 }));
      const data = await uploadToCloudinary(file, (pct) =>
        setUploading((u) => ({ ...u, [fieldPath]: pct }))
      );
      const url = data.secure_url || data.url;
      if (fieldPath === "photo") setForm((f) => ({ ...f, photo: url }));
      else if (fieldPath === "bg") setForm((f) => ({ ...f, bg: url }));
      else if (fieldPath.startsWith("aboutyourteam")) {
        const parts = fieldPath.split(".");
        const idx = Number(parts[1]);
        const key = parts[2];
        setForm((f) => {
          const newTeam = f.aboutyourteam.map((m, i) =>
            i === idx ? { ...m, [key]: url } : m
          );
          return { ...f, aboutyourteam: newTeam };
        });
      }
      push("Image uploaded");
    } catch (err) {
      console.error("Upload error", err?.response || err.message);
      push("Failed to upload image", "error");
    } finally {
      setUploading((u) => ({ ...u, [fieldPath]: undefined }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) {
      push(err, "error");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, colorIndex: Number(form.colorIndex || 0) };
      await axios.post(API_BASE, payload, { headers: { "Content-Type": "application/json" } });
      push("Request placed successfully");
      setForm({
        name: "",
        manifesto: "",
        photo: "",
        color: "#2563eb",
        colorIndex: 0,
        bg: "",
        email: "",
        approved: false,
        aboutyourteam: [{ memberName: "", memberRole: "", Info: "", memberPhoto: "" }],
      });
    } catch (err) {
      console.error(err?.response?.data || err.message);
      push(err?.response?.data?.message || "Failed to place request", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-6">
      <Toasts />
      <h2 className="text-xl font-semibold mb-4">Submit Request to be Candidate</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top-level inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-sm font-medium">Full name</span>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-md border px-3 py-2 bg-white text-gray-800"
              placeholder="Jane Doe"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Email</span>
            <input
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-md border px-3 py-2 bg-white text-gray-800"
              placeholder="jane@example.com"
            />
          </label>
        </div>

        <label className="space-y-1">
          <span className="text-sm font-medium">Manifesto (max 500 chars)</span>
          <textarea
            value={form.manifesto}
            onChange={(e) => setForm((f) => ({ ...f, manifesto: e.target.value }))}
            className="w-full rounded-md border px-3 py-2 h-28 bg-white text-gray-800"
            placeholder="What you stand for..."
          />
          <div className="text-xs text-gray-500">{form.manifesto.length}/500</div>
        </label>

        {/* Photo, background, accent */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="space-y-1">
            <span className="text-sm font-medium">Photo (upload)</span>
            <input type="file" accept="image/*" onChange={(e) => handleFileInputChange(e, "photo")} className="w-full" />
            {uploading["photo"] !== undefined && <div className="text-xs text-gray-500">Uploading: {uploading["photo"]}%</div>}
            {form.photo && <img src={form.photo} alt="candidate" className="w-full h-32 object-cover mt-2 rounded" />}
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Background (upload)</span>
            <input type="file" accept="image/*" onChange={(e) => handleFileInputChange(e, "bg")} className="w-full" />
            {uploading["bg"] !== undefined && <div className="text-xs text-gray-500">Uploading: {uploading["bg"]}%</div>}
            {form.bg && <img src={form.bg} alt="background" className="w-full h-32 object-cover mt-2 rounded" />}
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Accent color</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                className="w-12 h-10 p-0 border-0"
              />
              <input
                type="number"
                value={form.colorIndex}
                onChange={(e) => setForm((f) => ({ ...f, colorIndex: e.target.value }))}
                className="rounded-md border px-3 py-2 w-full bg-white text-gray-800"
              />
            </div>
          </label>
        </div>

        {/* Team members */}
        <div>
          <h3 className="text-lg font-medium mb-2">About your team</h3>
          <div className="space-y-4">
            {form.aboutyourteam.map((member, idx) => (
              <div key={idx} className="p-4 border rounded-lg grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                <div className="md:col-span-2">
                  <input
                    placeholder="Member name"
                    value={member.memberName}
                    onChange={(e) => updateTeamMember(idx, "memberName", e.target.value)}
                    className="w-full rounded-md border px-3 py-2 bg-white text-gray-800"
                  />
                </div>

                <div className="md:col-span-1">
                  <input
                    placeholder="Role"
                    value={member.memberRole}
                    onChange={(e) => updateTeamMember(idx, "memberRole", e.target.value)}
                    className="w-full rounded-md border px-3 py-2 bg-white text-gray-800"
                  />
                </div>

                <div className="md:col-span-1">
                  <input
                    placeholder="Photo (uploaded)"
                    value={member.memberPhoto}
                    readOnly
                    className="w-full rounded-md border px-3 py-2 bg-white text-gray-800"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileInputChange(e, `aboutyourteam.${idx}.memberPhoto`)}
                    className="w-full mt-2"
                  />
                  {uploading[`aboutyourteam.${idx}.memberPhoto`] !== undefined && (
                    <div className="text-xs text-gray-500">
                      Uploading: {uploading[`aboutyourteam.${idx}.memberPhoto`]}%
                    </div>
                  )}
                  {member.memberPhoto && <img src={member.memberPhoto} alt="member" className="w-full h-20 object-cover mt-2 rounded" />}
                </div>

                <div className="md:col-span-1 flex flex-col gap-2">
                  <textarea
                    placeholder="Short info"
                    value={member.Info}
                    onChange={(e) => updateTeamMember(idx, "Info", e.target.value)}
                    className="w-full rounded-md border px-3 py-2 h-20 bg-white text-gray-800"
                  />
                  <div className="flex gap-2 justify-end">
                    {form.aboutyourteam.length > 1 && (
                      <button type="button" onClick={() => removeTeamMember(idx)} className="text-sm text-red-600">
                        Remove
                      </button>
                    )}
                    {idx === form.aboutyourteam.length - 1 && (
                      <button type="button" onClick={addTeamMember} className="text-sm text-blue-600">
                        Add member
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button disabled={loading} type="submit" className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 disabled:opacity-60">
            {loading ? "Submitting..." : "Submit Request"}
          </button>

          <button
            type="button"
            onClick={() =>
              setForm({
                name: "",
                manifesto: "",
                photo: "",
                color: "#2563eb",
                colorIndex: 0,
                bg: "",
                email: "",
                approved: false,
                aboutyourteam: [{ memberName: "", memberRole: "", Info: "", memberPhoto: "" }],
              })
            }
            className="px-4 py-2 rounded-md border bg-white text-gray-800"
          >
            Clear
          </button>
        </div>

        {/* Preview */}
        <div className="pt-4">
          <h4 className="font-medium">Preview</h4>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 rounded-md overflow-hidden border">
              {form.photo ? (
                <img
                  src={form.photo}
                  alt="candidate photo"
                  className="w-full h-44 object-cover"
                />
              ) : (
                <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-400">
                  No photo
                </div>
              )}
            </div>

            <div className="col-span-2 p-3 rounded-md border">
              <div className="flex items-center justify-between">
                <h5 className="font-semibold">{form.name || "Your name"}</h5>
                <div className="rounded-md px-3 py-1 text-sm" style={{ background: form.color, color: "#fff" }}>
                  {form.colorIndex}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">{form.manifesto || "Your manifesto preview will appear here."}</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ---------- Admin Panel ---------- */
function AdminPanel() {
  const { push, Toasts } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchRequests() {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setRequests(res.data.request || []);
    } catch (err) {
      console.error(err?.response?.data || err.message);
      push("Failed to fetch requests", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div>
      <Toasts />
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">All Requests</h2>
        <div className="flex gap-2">
          <button onClick={fetchRequests} className="px-3 py-2 rounded-md border hover:bg-gray-100">
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : requests.length === 0 ? (
        <div>No requests found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((r) => (
            <div key={r._id} className="p-4 border rounded-lg bg-white">
              <img src={r.photo} alt={r.name} className="w-full h-40 object-cover rounded mb-2" />
              <h3 className="font-semibold">{r.name}</h3>
              <p className="text-sm text-gray-600">{r.email}</p>
              <p className="mt-2 text-gray-700 text-sm">{r.manifesto}</p>
              <p className="mt-2 text-xs text-gray-500">{r.approved ? "Approved" : "Pending"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
