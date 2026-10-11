import pool from '../config/db';
import { DASHBOARD_QUERIES } from '../queries/dashboard.queries';
import { RowDataPacket } from 'mysql2/promise';

const num = (v: any) => Number(v) || 0;
const round2 = (v: number) => Math.round(v * 100) / 100;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// 8 -> "8 AM", 12 -> "12 PM", 14 -> "2 PM"
const hourLabel = (h: number) => {
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12} ${suffix}`;
};

export class DashboardService {
  static async getSummary() {
    const [
      [todayRows],
      [salesRows],
      [profitRows],
      [hourlyRows],
      [weeklyRows],
      [topRows],
      [lowStockRows],
      [lowStockCountRows],
      [pendingRows],
      [pendingCountRows],
      [bulkTotalRows],
    ] = await Promise.all([
      pool.query<RowDataPacket[]>(DASHBOARD_QUERIES.GET_TODAY),
      pool.query<RowDataPacket[]>(DASHBOARD_QUERIES.GET_TODAYS_SALES),
      pool.query<RowDataPacket[]>(DASHBOARD_QUERIES.GET_TODAYS_PROFIT),
      pool.query<RowDataPacket[]>(DASHBOARD_QUERIES.GET_HOURLY_SALES),
      pool.query<RowDataPacket[]>(DASHBOARD_QUERIES.GET_WEEKLY_SALES),
      pool.query<RowDataPacket[]>(DASHBOARD_QUERIES.GET_TOP_PRODUCTS),
      pool.query<RowDataPacket[]>(DASHBOARD_QUERIES.GET_LOW_STOCK_PRODUCTS),
      pool.query<RowDataPacket[]>(DASHBOARD_QUERIES.GET_LOW_STOCK_COUNT),
      pool.query<RowDataPacket[]>(DASHBOARD_QUERIES.GET_PENDING_DELIVERIES),
      pool.query<RowDataPacket[]>(DASHBOARD_QUERIES.GET_PENDING_DELIVERIES_COUNT),
      pool.query<RowDataPacket[]>(DASHBOARD_QUERIES.GET_BULK_ORDERS_TOTAL),
    ]);

    // ---------- KPI cards ----------
    const todaySales = round2(num(salesRows[0]?.total_sales));
    const todayBills = num(salesRows[0]?.total_bills);
    const avgTicket = todayBills > 0 ? Math.round(todaySales / todayBills) : 0;

    const estimatedProfit = round2(num(profitRows[0]?.profit));
    const revenue = num(profitRows[0]?.revenue);
    const profitMargin = revenue > 0 ? round2((estimatedProfit / revenue) * 100) : 0;

    // ---------- Today's hourly chart (2-hour slots, 8 AM to 10 PM) ----------
    const slotStarts = [8, 10, 12, 14, 16, 18, 20, 22];
    const hourlyMap = new Map<number, { sales: number; bills: number }>(
      slotStarts.map((h) => [h, { sales: 0, bills: 0 }])
    );
    for (const r of hourlyRows) {
      const hr = num(r.hr);
      // sales before 8 AM count in the first slot, after 10 PM in the last slot
      const slot = Math.min(22, Math.max(8, Math.floor(hr / 2) * 2));
      const cur = hourlyMap.get(slot)!;
      cur.sales += num(r.sales);
      cur.bills += num(r.bills);
    }
    const hourlyData = slotStarts.map((h) => ({
      time: hourLabel(h),
      sales: round2(hourlyMap.get(h)!.sales),
      bills: hourlyMap.get(h)!.bills,
    }));

    // ---------- Weekly chart (last 7 days, missing days = 0) ----------
    const todayStr: string = todayRows[0]?.today; // 'YYYY-MM-DD' from the database
    const weeklyMap = new Map<string, { sales: number; bills: number }>(
      weeklyRows.map((r) => [String(r.day), { sales: num(r.sales), bills: num(r.bills) }])
    );
    const weeklyData: { time: string; sales: number; bills: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(`${todayStr}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      const v = weeklyMap.get(key) ?? { sales: 0, bills: 0 };
      weeklyData.push({ time: WEEKDAYS[d.getUTCDay()], sales: round2(v.sales), bills: v.bills });
    }

    // ---------- Lists ----------
    const topProducts = topRows.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category ?? '',
      unit: p.unit,
      sellingPrice: num(p.sellingPrice),
      stock: num(p.stock),
      image: p.image || null,
      isHighDemand: Boolean(p.isHighDemand),
      soldQty: num(p.soldQty),
      soldAmount: round2(num(p.soldAmount)),
    }));

    const lowStockProducts = lowStockRows.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category ?? '',
      unit: p.unit,
      sellingPrice: num(p.sellingPrice),
      stock: num(p.stock),
      minStock: num(p.minStock),
      image: p.image || null,
    }));

    const pendingDeliveries = pendingRows.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      deliveryDate: o.deliveryDate,
      deliveryTime: o.deliveryTime,
      status: o.status,
      remainingAmount: num(o.remainingAmount),
    }));

    return {
      // KPI cards
      todaySales,
      todayBills,
      todayOrders: todayBills, // kept for older code that used this name
      avgTicket,
      estimatedProfit,
      profitMargin,

      // counts + lists
      pendingDeliveries,
      pendingDeliveriesCount: num(pendingCountRows[0]?.pending_count),
      lowStockProducts,
      lowStockCount: num(lowStockCountRows[0]?.low_stock_count),
      bulkOrdersTotal: num(bulkTotalRows[0]?.total),

      // charts + top list
      topProducts,
      hourlyData,
      weeklyData,
    };
  }
}