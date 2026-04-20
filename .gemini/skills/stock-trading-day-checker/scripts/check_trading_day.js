#!/usr/bin/env node

/**
 * Checks if a given date is a NYSE trading day.
 * 
 * Usage:
 * node check_trading_day.js [YYYY-MM-DD]
 * Defaults to today if no date provided.
 */

function getNYSEHolidays(year) {
  // Approximate NYSE Holidays (Standard Rules)
  const holidays = [
    new Date(year, 0, 1),  // New Year's Day
    getMLKDay(year),       // Martin Luther King, Jr. Day (3rd Monday in Jan)
    getPresidentsDay(year),// Washington's Birthday (3rd Monday in Feb)
    getGoodFriday(year),   // Good Friday (Varies)
    getMemorialDay(year),  // Memorial Day (Last Monday in May)
    new Date(year, 5, 19), // Juneteenth
    new Date(year, 6, 4),  // Independence Day
    getLaborDay(year),     // Labor Day (1st Monday in Sept)
    getThanksgiving(year), // Thanksgiving Day (4th Thursday in Nov)
    new Date(year, 11, 25) // Christmas Day
  ];

  // Apply Observed Rules:
  // Sat -> Fri (unless Fri is in different year or another holiday)
  // Sun -> Mon
  const observed = [];
  holidays.forEach(h => {
    const day = h.getDay();
    if (day === 6) { // Saturday
       observed.push(new Date(h.getTime() - 86400000));
    } else if (day === 0) { // Sunday
       observed.push(new Date(h.getTime() + 86400000));
    } else {
       observed.push(h);
    }
  });

  return observed.map(d => d.toISOString().split('T')[0]);
}

function getMLKDay(year) {
  const d = new Date(year, 0, 1);
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
  return new Date(d.getTime() + 1209600000);
}

function getPresidentsDay(year) {
  const d = new Date(year, 1, 1);
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
  return new Date(d.getTime() + 1209600000);
}

function getLaborDay(year) {
  const d = new Date(year, 8, 1);
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
  return d;
}

function getThanksgiving(year) {
  const d = new Date(year, 10, 1);
  while (d.getDay() !== 4) d.setDate(d.getDate() + 1);
  return new Date(d.getTime() + 1814400000);
}

function getMemorialDay(year) {
  const d = new Date(year, 5, 1);
  d.setDate(d.getDate() - 1);
  while (d.getDay() !== 1) d.setDate(d.getDate() - 1);
  return d;
}

function getGoodFriday(year) {
  // Easter calculation (Meeus/Jones/Butcher algorithm)
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  const easter = new Date(year, month - 1, day);
  return new Date(easter.getTime() - 172800000); // 2 days before Easter
}

function checkTradingDay() {
  let inputDate;
  if (process.argv[2]) {
    // Parse YYYY-MM-DD manually to avoid timezone issues
    const parts = process.argv[2].split('-');
    inputDate = new Date(parts[0], parts[1] - 1, parts[2]);
  } else {
    inputDate = new Date();
  }
  
  if (isNaN(inputDate.getTime())) {
    console.error('Error: Invalid date format. Please use YYYY-MM-DD.');
    process.exit(1);
  }

  // Format as YYYY-MM-DD for comparison (LOCAL TIME)
  const y = inputDate.getFullYear();
  const m = String(inputDate.getMonth() + 1).padStart(2, '0');
  const d = String(inputDate.getDate()).padStart(2, '0');
  const dateStr = `${y}-${m}-${d}`;
  
  const dayOfWeek = inputDate.getDay();
  const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
  
  const holidays = getNYSEHolidays(y);
  const isHoliday = holidays.includes(dateStr);

  const isTradingDay = !isWeekend && !isHoliday;

  console.log(isTradingDay);
}

checkTradingDay();
