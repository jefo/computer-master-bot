// src/app/mock-data.ts
// Mock-данные для демонстрации функций бота

export interface Store {
  id: string;
  name: string;
  supervisorId?: string;
  monthlyPlan: number;
  currentRevenue: number;
}

export interface Seller {
  id: string;
  name: string;
  monthlyPlan: number;
  currentRevenue: number;
  shiftsWorked: number;
  storesWorked: string[]; // IDs of stores where this seller works
}

export interface Shift {
  id: string;
  sellerId: string;
  storeId: string;
  date: string; // in format YYYY-MM-DD
  startTime: string; // in format HH:MM
  endTime: string; // in format HH:MM
  revenueReport: RevenueReport;
  status: 'active' | 'ended' | 'emergency_closed';
}

export interface RevenueReport {
  revenue: number;
  cash: number;
  card: number;
  qr: number;
  transfer: number;
  returns: number;
  photos: string[]; // URLs or identifiers for the 4 required photos
  submittedAt: string; // in format YYYY-MM-DD HH:MM:SS
}

export interface ReportHistoryItem {
  date: string; // in format YYYY-MM-DD
  revenue: number;
  report: RevenueReport;
}

export interface MonthlyStats {
  month: string; // in format YYYY-MM (e.g., "2024-01")
  revenue: number;
  shiftsWorked: number;
  plan: number;
  reports: ReportHistoryItem[];
}

export interface WorkMaterial {
  id: string;
  title: string;
  category: 'regulations' | 'materials' | 'scripts';
  fileName: string;
  fileSize: string; // e.g. "2.5 MB"
  downloadUrl: string;
}

export interface Plan {
  id: string;
  targetType: 'store' | 'seller'; // What the plan is for
  targetId: string; // ID of the store or seller
  month: string; // in format YYYY-MM
  amount: number; // Planned revenue
  period: 'monthly'; // Could be extended to other periods later
}

// Mock stores
export const MOCK_STORES: Store[] = [
  { 
    id: "store_1", 
    name: "ТЦ 'Галерея'", 
    monthlyPlan: 500000, 
    currentRevenue: 320000 
  },
  { 
    id: "store_2", 
    name: "ТРК 'Планета'", 
    monthlyPlan: 450000, 
    currentRevenue: 280000 
  },
  { 
    id: "store_3", 
    name: "ул. Красная, 105", 
    monthlyPlan: 600000, 
    currentRevenue: 410000 
  },
  { 
    id: "store_4", 
    name: "ТЦ 'Северный'", 
    monthlyPlan: 550000, 
    currentRevenue: 190000 
  },
];

// Mock sellers
export const MOCK_SELLERS: Seller[] = [
  { 
    id: "seller_1", 
    name: "Иванов И.И.", 
    monthlyPlan: 300000, 
    currentRevenue: 180000, 
    shiftsWorked: 15,
    storesWorked: ["store_1", "store_2"]
  },
  { 
    id: "seller_2", 
    name: "Петрова П.П.", 
    monthlyPlan: 350000, 
    currentRevenue: 210000, 
    shiftsWorked: 18,
    storesWorked: ["store_2", "store_3"]
  },
  { 
    id: "seller_3", 
    name: "Сидоров С.С.", 
    monthlyPlan: 400000, 
    currentRevenue: 290000, 
    shiftsWorked: 20,
    storesWorked: ["store_1", "store_3", "store_4"]
  },
  { 
    id: "seller_4", 
    name: "Козлова А.А.", 
    monthlyPlan: 280000, 
    currentRevenue: 220000, 
    shiftsWorked: 16,
    storesWorked: ["store_3", "store_4"]
  },
];

// Mock shifts
export const MOCK_SHIFTS: Shift[] = [
  {
    id: "shift_1",
    sellerId: "seller_1",
    storeId: "store_1",
    date: "2024-01-15",
    startTime: "10:00",
    endTime: "18:00",
    revenueReport: {
      revenue: 25000,
      cash: 8000,
      card: 12000,
      qr: 3000,
      transfer: 2000,
      returns: 0,
      photos: [
        "photo_envelope_signature_1",
        "photo_receipts_summary_1", 
        "photo_envelope_contents_1",
        "photo_sealed_envelope_1"
      ],
      submittedAt: "2024-01-15 18:30:00"
    },
    status: "ended"
  },
  {
    id: "shift_2",
    sellerId: "seller_2",
    storeId: "store_2",
    date: "2024-01-16",
    startTime: "09:00",
    endTime: "17:00",
    revenueReport: {
      revenue: 32000,
      cash: 10000,
      card: 18000,
      qr: 2500,
      transfer: 1500,
      returns: 500,
      photos: [
        "photo_envelope_signature_2",
        "photo_receipts_summary_2", 
        "photo_envelope_contents_2",
        "photo_sealed_envelope_2"
      ],
      submittedAt: "2024-01-16 17:30:00"
    },
    status: "ended"
  },
  {
    id: "shift_3",
    sellerId: "seller_3",
    storeId: "store_1",
    date: "2024-01-17",
    startTime: "11:00",
    endTime: "19:00",
    revenueReport: {
      revenue: 18000,
      cash: 6000,
      card: 10000,
      qr: 1500,
      transfer: 500,
      returns: 200,
      photos: [
        "photo_envelope_signature_3",
        "photo_receipts_summary_3", 
        "photo_envelope_contents_3",
        "photo_sealed_envelope_3"
      ],
      submittedAt: "2024-01-17 19:20:00"
    },
    status: "ended"
  }
];

// Mock monthly statistics for sellers
export const MOCK_MONTHLY_STATS: Record<string, MonthlyStats[]> = {
  seller_1: [
    {
      month: "2023-12",
      revenue: 280000,
      shiftsWorked: 18,
      plan: 300000,
      reports: [
        { date: "2023-12-01", revenue: 15000, report: MOCK_SHIFTS[0].revenueReport },
        { date: "2023-12-03", revenue: 18000, report: MOCK_SHIFTS[0].revenueReport },
        { date: "2023-12-05", revenue: 22000, report: MOCK_SHIFTS[0].revenueReport },
      ]
    },
    {
      month: "2024-01",
      revenue: 180000,
      shiftsWorked: 15,
      plan: 300000,
      reports: [
        { date: "2024-01-10", revenue: 20000, report: MOCK_SHIFTS[0].revenueReport },
        { date: "2024-01-12", revenue: 18000, report: MOCK_SHIFTS[0].revenueReport },
        { date: "2024-01-15", revenue: 25000, report: MOCK_SHIFTS[0].revenueReport },
      ]
    }
  ],
  seller_2: [
    {
      month: "2023-12",
      revenue: 310000,
      shiftsWorked: 20,
      plan: 350000,
      reports: [
        { date: "2023-12-02", revenue: 16000, report: MOCK_SHIFTS[1].revenueReport },
        { date: "2023-12-05", revenue: 22000, report: MOCK_SHIFTS[1].revenueReport },
      ]
    },
    {
      month: "2024-01",
      revenue: 210000,
      shiftsWorked: 18,
      plan: 350000,
      reports: [
        { date: "2024-01-08", revenue: 17000, report: MOCK_SHIFTS[1].revenueReport },
        { date: "2024-01-11", revenue: 19000, report: MOCK_SHIFTS[1].revenueReport },
        { date: "2024-01-16", revenue: 32000, report: MOCK_SHIFTS[1].revenueReport },
      ]
    }
  ]
};

// Mock work materials for sellers
export const MOCK_SELLER_WORK_MATERIALS: WorkMaterial[] = [
  {
    id: "smat_1",
    title: "Регламент работы с покупателями",
    category: "regulations",
    fileName: "seller_reglament_raboty.pdf",
    fileSize: "1.2 MB",
    downloadUrl: "#"
  },
  {
    id: "smat_2",
    title: "Скрипт обслуживания покупателей",
    category: "scripts",
    fileName: "seller_skript_observaniya.docx",
    fileSize: "0.8 MB",
    downloadUrl: "#"
  },
  {
    id: "smat_3",
    title: "Информационные материалы о продукции",
    category: "materials",
    fileName: "seller_info_materials.pdf",
    fileSize: "2.5 MB",
    downloadUrl: "#"
  },
  {
    id: "smat_4",
    title: "Правила внутреннего распорядка",
    category: "regulations",
    fileName: "seller_pravila_rasporjadka.pdf",
    fileSize: "0.5 MB",
    downloadUrl: "#"
  },
  {
    id: "smat_5",
    title: "Скрипт продажи премиум-товаров",
    category: "scripts",
    fileName: "seller_premium_sales_script.docx",
    fileSize: "1.0 MB",
    downloadUrl: "#"
  }
];

// Mock work materials for supervisors
export const MOCK_SUPERVISOR_WORK_MATERIALS: WorkMaterial[] = [
  {
    id: "sumat_1",
    title: "Регламенты для супервайзеров",
    category: "regulations",
    fileName: "sup_reglamenty.pdf",
    fileSize: "1.6 MB",
    downloadUrl: "#"
  },
  {
    id: "sumat_2",
    title: "Скрипты для супервайзеров",
    category: "scripts",
    fileName: "sup_skripty.docx",
    fileSize: "1.1 MB",
    downloadUrl: "#"
  },
  {
    id: "sumat_3",
    title: "Информационные материалы для супервайзеров",
    category: "materials",
    fileName: "sup_info_materials.pdf",
    fileSize: "2.1 MB",
    downloadUrl: "#"
  },
  {
    id: "sumat_4",
    title: "Отчетность и контроль",
    category: "regulations",
    fileName: "sup_otchetnost.pdf",
    fileSize: "1.3 MB",
    downloadUrl: "#"
  }
];

// Mock work materials for managers
export const MOCK_MANAGER_WORK_MATERIALS: WorkMaterial[] = [
  {
    id: "mmat_1",
    title: "Корпоративные стратегии",
    category: "regulations",
    fileName: "man_strategii.pdf",
    fileSize: "2.2 MB",
    downloadUrl: "#"
  },
  {
    id: "mmat_2",
    title: "Руководство по принятию решений",
    category: "scripts",
    fileName: "man_resheniya.docx",
    fileSize: "1.4 MB",
    downloadUrl: "#"
  },
  {
    id: "mmat_3",
    title: "Аналитические материалы",
    category: "materials",
    fileName: "man_analitika.pdf",
    fileSize: "3.0 MB",
    downloadUrl: "#"
  },
  {
    id: "mmat_4",
    title: "Отчеты по эффективности",
    category: "materials",
    fileName: "man_effectivnost.pdf",
    fileSize: "2.7 MB",
    downloadUrl: "#"
  }
];

// Mock plans
export const MOCK_PLANS: Plan[] = [
  {
    id: "plan_1",
    targetType: "store",
    targetId: "store_1",
    month: "2024-01",
    amount: 500000,
    period: "monthly"
  },
  {
    id: "plan_2",
    targetType: "store",
    targetId: "store_2",
    month: "2024-01",
    amount: 450000,
    period: "monthly"
  },
  {
    id: "plan_3",
    targetType: "seller",
    targetId: "seller_1",
    month: "2024-01",
    amount: 300000,
    period: "monthly"
  },
  {
    id: "plan_4",
    targetType: "seller",
    targetId: "seller_2",
    month: "2024-01",
    amount: 350000,
    period: "monthly"
  }
];

// Function to get seller by ID
export const getSellerById = (id: string): Seller | undefined => {
  return MOCK_SELLERS.find(seller => seller.id === id);
};

// Function to get store by ID
export const getStoreById = (id: string): Store | undefined => {
  return MOCK_STORES.find(store => store.id === id);
};

// Function to get shifts for a specific seller
export const getShiftsForSeller = (sellerId: string): Shift[] => {
  return MOCK_SHIFTS.filter(shift => shift.sellerId === sellerId);
};

// Function to get shifts for a specific store
export const getShiftsForStore = (storeId: string): Shift[] => {
  return MOCK_SHIFTS.filter(shift => shift.storeId === storeId);
};

// Function to get monthly stats for a seller
export const getMonthlyStatsForSeller = (sellerId: string): MonthlyStats[] => {
  return MOCK_MONTHLY_STATS[sellerId] || [];
};

// Function to get materials by category and role
export const getMaterialsByCategoryAndRole = (category: string, role: 'seller' | 'supervisor' | 'manager'): WorkMaterial[] => {
  let materials: WorkMaterial[] = [];
  switch(role) {
    case 'seller':
      materials = MOCK_SELLER_WORK_MATERIALS;
      break;
    case 'supervisor':
      materials = MOCK_SUPERVISOR_WORK_MATERIALS;
      break;
    case 'manager':
      materials = MOCK_MANAGER_WORK_MATERIALS;
      break;
  }
  
  return materials.filter(material => material.category === category);
};

// Function to get all materials for a role
export const getAllMaterialsForRole = (role: 'seller' | 'supervisor' | 'manager'): WorkMaterial[] => {
  switch(role) {
    case 'seller':
      return MOCK_SELLER_WORK_MATERIALS;
    case 'supervisor':
      return MOCK_SUPERVISOR_WORK_MATERIALS;
    case 'manager':
      return MOCK_MANAGER_WORK_MATERIALS;
  }
};