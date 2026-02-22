// --- ตำแหน่งและขนาด (Layout) ---
export const FIXED_Y = 300;         // ความสูงจากขอบบนที่เท้าตัวละครวางอยู่
export const PLAYER_X_POS = 10;     // ตำแหน่งแกน X ของผู้เล่น (%)

export const DISPLAY_NORMAL = 16 * 3.5;  // ขนาด Sprite ปกติ (16px scaled)
export const DISPLAY_WIDE = 32 * 3.5;    // ขนาด Sprite ตอนโจมตี (กว้างกว่าปกติ)

// --- ระบบกระเป๋า (Inventory) ---
export const INVENTORY_COUNT = 20;  // จำนวนช่องในกระเป๋าทั้งหมด (รวมที่ล็อคอยู่)

// --- การเชื่อมต่อ (Networking) ---
export const ipAddress = import.meta.env.VITE_API_URL;
export const mapID = "green-grass-1";