// // src/utils/assetLoader.js

// /**
//  * ฟังก์ชันสำหรับ Preload รูปภาพทั้งหมดก่อนเริ่มเกม
//  * @param {string[]} sources - รายการ URL หรือ Path ของรูปภาพทั้งหมด
//  * @param {function} onProgress - Callback ฟังก์ชันสำหรับส่งค่าความคืบหน้า (0-100)
//  * @returns {Promise<void>}
//  */
// export const preloadImages = async (sources, onProgress) => {
//   let loadedCount = 0;
//   const total = sources.length;

//   // กรณีไม่มีรูปให้โหลดเลย ให้ส่ง 100% กลับไปทันที
//   if (total === 0) {
//     onProgress(100);
//     return;
//   }

//   const loadSingleImage = (src) => {
//     return new Promise((resolve) => {
//       const img = new Image();
//       img.src = src;

//       img.onload = () => {
//         loadedCount++;
//         onProgress(Math.round((loadedCount / total) * 100)); // ส่งค่า % กลับไป
//         resolve();
//       };

//       img.onerror = () => {
//         console.error(`Failed to load image: ${src}`);
//         // ถึงโหลดไม่สำเร็จ ก็ให้นับว่า "จัดการแล้ว" เพื่อให้ Progress bar วิ่งจนจบและเข้าเกมได้
//         loadedCount++;
//         onProgress(Math.round((loadedCount / total) * 100));
//         resolve();
//       };
//     });
//   };

//   // โหลดทุกรูปพร้อมกันแบบ Parallel เพื่อความรวดเร็ว
//   await Promise.all(sources.map(loadSingleImage));
// };