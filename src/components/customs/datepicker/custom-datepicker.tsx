// import React, { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Popover,
//   PopoverTrigger,
//   PopoverContent,
// } from "@/components/ui/popover";
// import { DateRange } from "react-day-picker";
// import { MdDateRange } from "react-icons/md";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";

// type DateFilterType = {
//   type: string;
//   value: string;
// };

// type DateRangeType = {
//   from?: Date;
//   to?: Date;
// };

// interface DateRangePickerProps {
//   onDateRangeChange?: (range: DateRangeType) => void;
//   onFilterTypeChange?: (filterType: string) => void;
//   defaultFilter?: string;
//   defaultRange?: DateRangeType;
// }

// const dateFilterTypes: DateFilterType[] = [
//   { type: "All Time", value: "all_time" },
//   { type: "This Week", value: "this_week" },
//   { type: "Last Week", value: "last_week" },
//   { type: "This Month", value: "this_month" },
//   { type: "Last Month", value: "last_month" },
//   { type: "This Year", value: "this_year" },
//   { type: "Last Year", value: "last_year" },
//   { type: "Date Range", value: "date_range" },
// ];

// type DateFilterValue = 
//   | 'all_time'
//   | 'this_week'
//   | 'last_week'
//   | 'this_month'
//   | 'last_month'
//   | 'this_year'
//   | 'last_year'
//   | 'date_range';

// const DateRangePicker: React.FC<DateRangePickerProps> = ({
//   onDateRangeChange,
//   onFilterTypeChange,
//   defaultFilter = 'all_time',
//   defaultRange = { from: undefined, to: undefined },
// }) => {
//   // The filter that is currently applied and visible outside the popover
//   const [appliedFilter, setAppliedFilter] = useState<DateFilterValue>(defaultFilter as DateFilterValue);
//   const [appliedRange, setAppliedRange] = useState<DateRangeType>(defaultRange);

//   // The filter selected inside the popover, not yet applied
//   const [selectedFilter, setSelectedFilter] = useState<DateFilterValue>(appliedFilter as DateFilterValue);
//   const [selectedRange, setSelectedRange] = useState<DateRangeType>(appliedRange);
//   const [isOpen, setIsOpen] = useState<boolean>(false);

//   // When the popover opens, sync the internal state with the applied state
//   useEffect(() => {
//     if (isOpen) {
//       setSelectedFilter(appliedFilter);
//       setSelectedRange(appliedRange);
//     }
//   }, [isOpen, appliedFilter, appliedRange]);

//   // Handle radio button changes for predefined filters
//   const handleFilterChange = (value: string) => {
//     const filterValue = value as DateFilterValue;
//     setSelectedFilter(filterValue);
    
//     // If a predefined filter is chosen, clear the custom range
//     if (filterValue !== 'date_range') {
//       setSelectedRange({ from: undefined, to: undefined });
//     }
//   };

//   // Handle closing the popover
//   const handleClose = () => {
//     setIsOpen(false);
//   };

//   // Handle applying the selected filter
//   const handleApply = () => {
//     let finalRange: DateRangeType = { from: undefined, to: undefined };

//     if (selectedFilter === 'date_range') {
//       if (selectedRange.from && selectedRange.to) {
//         const from = new Date(selectedRange.from);
//         from.setHours(0, 0, 0, 0);
//         const to = new Date(selectedRange.to);
//         to.setHours(23, 59, 59, 999);
//         finalRange = { from, to };
//       }
//     } else if (selectedFilter !== 'all_time') {
//       finalRange = calculateDateRange(selectedFilter);
//     }

//     // Update the applied state and call the parent handlers
//     setAppliedFilter(selectedFilter);
//     setAppliedRange(finalRange);
//     if (onDateRangeChange) onDateRangeChange(finalRange);
//     if (onFilterTypeChange) onFilterTypeChange(selectedFilter);

//     setIsOpen(false);
//   };

//   // Helper functions for date calculations
//   const getStartOfDay = (date: Date): Date => {
//     const d = new Date(date);
//     d.setHours(0, 0, 0, 0);
//     return d;
//   };

//   const getEndOfDay = (date: Date): Date => {
//     const d = new Date(date);
//     d.setHours(23, 59, 59, 999);
//     return d;
//   };

//   const getStartOfWeek = (date: Date): Date => {
//     const d = new Date(date);
//     const day = d.getDay();
//     const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
//     return new Date(d.setDate(diff));
//   };

//   const getEndOfWeek = (date: Date): Date => {
//     const start = getStartOfWeek(date);
//     const end = new Date(start);
//     end.setDate(start.getDate() + 6);
//     return end;
//   };

//   // Calculate date ranges for predefined filters
//   const calculateDateRange = (filter: DateFilterValue): DateRangeType => {
//     const now = new Date();
//     const currentYear = now.getFullYear();
//     const currentMonth = now.getMonth();
    
//     switch (filter) {
//       case 'this_week': {
//         const startOfWeek = getStartOfWeek(now);
//         const endOfWeek = getEndOfWeek(now);
//         return {
//           from: getStartOfDay(startOfWeek),
//           to: getEndOfDay(endOfWeek)
//         };
//       }
//       case 'last_week': {
//         const lastWeek = new Date(now);
//         lastWeek.setDate(now.getDate() - 7);
//         const startOfLastWeek = getStartOfWeek(lastWeek);
//         const endOfLastWeek = getEndOfWeek(lastWeek);
//         return {
//           from: getStartOfDay(startOfLastWeek),
//           to: getEndOfDay(endOfLastWeek)
//         };
//       }
//       case 'this_month': {
//         const firstDay = new Date(currentYear, currentMonth, 1);
//         const lastDay = new Date(currentYear, currentMonth + 1, 0);
//         return {
//           from: getStartOfDay(firstDay),
//           to: getEndOfDay(lastDay)
//         };
//       }
//       case 'last_month': {
//         const firstDay = new Date(currentYear, currentMonth - 1, 1);
//         const lastDay = new Date(currentYear, currentMonth, 0);
//         return {
//           from: getStartOfDay(firstDay),
//           to: getEndOfDay(lastDay)
//         };
//       }
//       case 'this_year': {
//         const firstDay = new Date(currentYear, 0, 1);
//         const lastDay = new Date(currentYear, 11, 31);
//         return {
//           from: getStartOfDay(firstDay),
//           to: getEndOfDay(lastDay)
//         };
//       }
//       case 'last_year': {
//         const firstDay = new Date(currentYear - 1, 0, 1);
//         const lastDay = new Date(currentYear - 1, 11, 31);
//         return {
//           from: getStartOfDay(firstDay),
//           to: getEndOfDay(lastDay)
//         };
//       }
//       default:
//         return { from: undefined, to: undefined };
//     }
//   };

//   // Format date to YYYY-MM-DD for display
//   const formatDateForDisplay = (date?: Date): string => {
//     if (!date) return '';
    
//     const d = new Date(date);
//     if (isNaN(d.getTime())) return '';
    
//     const year = d.getFullYear();
//     const month = String(d.getMonth() + 1).padStart(2, '0');
//     const day = String(d.getDate()).padStart(2, '0');
    
//     return `${year}-${month}-${day}`;
//   };

//   // Get the display text for the trigger button
//   const getDisplayText = (): string => {
//     if (appliedFilter === 'date_range' && appliedRange.from && appliedRange.to) {
//       return `${formatDateForDisplay(appliedRange.from)} – ${formatDateForDisplay(appliedRange.to)}`;
//     }
//     return dateFilterTypes.find((f) => f.value === appliedFilter)?.type || 'Select Date';
//   };

//   // Handle date range selection from calendar
//   const handleDateRangeSelect = (range: DateRange | undefined) => {
//     if (!range) return;
//     setSelectedRange({
//       from: range.from,
//       to: range.to
//     });
//   };

//   return (
//     <div className="relative">
//       <Popover open={isOpen} onOpenChange={setIsOpen}>
//         <PopoverTrigger asChild>
//           <Button
//             variant="outline"
//             className="justify-start text-left font-normal w-full md:w-auto min-w-[200px]"
//             aria-label="Select date range"
//           >
//             <MdDateRange className="mr-2 h-4 w-4 flex-shrink-0" />
//             <span className="truncate">{getDisplayText()}</span>
//           </Button>
//         </PopoverTrigger>
//         <PopoverContent
//           className={`w-auto p-0 ${selectedFilter === 'date_range' ? 'min-w-[580px]' : 'min-w-[320px]'}`}
//           align="start"
//           sideOffset={8}
//         >
//           <div className="p-4">
//             <h3 className="font-semibold text-start mb-4 text-base">Filter by Date</h3>
//             <RadioGroup
//               value={selectedFilter}
//               onValueChange={handleFilterChange}
//               className="grid grid-cols-2 gap-3"
//             >
//               {dateFilterTypes.map(({ type, value }, i) => (
//                 <div
//                   key={value}
//                   className={`${
//                     i === dateFilterTypes.length - 1
//                       ? 'border-t col-span-2 pt-3 mt-1'
//                       : ''
//                   } flex items-center gap-2`}
//                 >
//                   <RadioGroupItem value={value} id={value} />
//                   <Label 
//                     htmlFor={value} 
//                     className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
//                   >
//                     {type}
//                   </Label>
//                 </div>
//               ))}
//             </RadioGroup>

//             {selectedFilter === 'date_range' && (
//               <div className="mt-4">
//                 <Calendar
//                   mode="range"
//                   selected={selectedRange}
//                   onSelect={handleDateRangeSelect}
//                   className="rounded-md border"
//                   numberOfMonths={2}
//                   defaultMonth={selectedRange?.from || new Date()}
//                   disabled={(date) => date > new Date()}
//                 />
//               </div>
//             )}
//           </div>
//           <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-md">
//             <Button 
//               variant="outline" 
//               size="sm" 
//               onClick={handleClose}
//               className="px-4"
//             >
//               Cancel
//             </Button>
//             <Button 
//               size="sm" 
//               onClick={handleApply}
//               className="px-4 bg-blue-600 hover:bg-blue-700"
//               disabled={selectedFilter === 'date_range' && (!selectedRange?.from || !selectedRange?.to)}
//             >
//               Apply
//             </Button>
//           </div>
//         </PopoverContent>
//       </Popover>
//     </div>
//   );
// };

// export default DateRangePicker;