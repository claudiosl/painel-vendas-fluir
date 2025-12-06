import { SalesData, KPIMetrics } from '../types';

export const calculateKPIs = (data: SalesData[]): KPIMetrics => {
  const totalCalls = data.filter(d => d.type === 'call').length;
  const connectedCalls = data.filter(d => d.type === 'call' && d.outcome === 'connected').length;
  
  const meetingsBooked = data.filter(d => d.type === 'meeting_booked').length;
  const meetingsHeld = data.filter(d => d.type === 'meeting_held' && d.outcome === 'show').length;
  const meetingsTotal = data.filter(d => d.type === 'meeting_held').length;
  
  const proposalsSent = data.filter(d => d.type === 'proposal').length;
  
  const salesClosed = data.filter(d => d.type === 'sale' && d.outcome === 'closed_won').length;
  
  const totalRevenue = data
    .filter(d => d.type === 'sale' && d.outcome === 'closed_won')
    .reduce((acc, curr) => acc + (curr.value || 0), 0);

  // Helper for percentage
  const safeDiv = (num: number, den: number) => (den === 0 ? 0 : (num / den) * 100);

  // Sales by Product
  const salesByProduct: Record<string, number> = {};
  data
    .filter(d => d.type === 'sale' && d.outcome === 'closed_won' && d.product)
    .forEach(d => {
      salesByProduct[d.product!] = (salesByProduct[d.product!] || 0) + (d.value || 0);
    });

  // Sales by Source
  const salesBySource: Record<string, number> = {};
   data
    .filter(d => d.type === 'sale' && d.outcome === 'closed_won' && d.leadSource)
    .forEach(d => {
      salesBySource[d.leadSource!] = (salesBySource[d.leadSource!] || 0) + 1;
    });

  return {
    totalCalls,
    connectedCalls,
    meetingsBooked,
    meetingsHeld,
    proposalsSent,
    salesClosed,
    totalRevenue,
    avgTicket: salesClosed === 0 ? 0 : totalRevenue / salesClosed,
    avgSalesCycle: salesClosed > 0 ? 14 : 0, // Mock calculation: assumes ~14 days if data exists, real calc requires entity linking
    
    connectionRate: safeDiv(connectedCalls, totalCalls),
    callToMeetingRate: safeDiv(meetingsBooked, totalCalls),
    showRate: safeDiv(meetingsHeld, meetingsTotal),
    meetingToProposalRate: safeDiv(proposalsSent, meetingsHeld),
    proposalToSaleRate: safeDiv(salesClosed, proposalsSent),
    overallConversion: safeDiv(salesClosed, meetingsBooked),

    salesByProduct,
    salesBySource
  };
};

export const getTeamPerformance = (data: SalesData[], role: 'sdr' | 'closer') => {
  const grouped: Record<string, any> = {};

  data.forEach(d => {
    const name = role === 'sdr' ? d.sdrName : (d.closerName || 'N/A');
    if (!name || name === 'N/A') return;

    if (!grouped[name]) {
      grouped[name] = { 
        name, 
        calls: 0, 
        meetingsBooked: 0, 
        meetingsHeld: 0, 
        sales: 0, 
        revenue: 0,
        proposals: 0 
      };
    }

    if (d.type === 'call') grouped[name].calls++;
    if (d.type === 'meeting_booked') grouped[name].meetingsBooked++;
    if (d.type === 'meeting_held' && d.outcome === 'show') grouped[name].meetingsHeld++;
    if (d.type === 'proposal') grouped[name].proposals++;
    if (d.type === 'sale' && d.outcome === 'closed_won') {
      grouped[name].sales++;
      grouped[name].revenue += (d.value || 0);
    }
  });

  return Object.values(grouped).sort((a: any, b: any) => b.revenue - a.revenue || b.sales - a.sales);
};