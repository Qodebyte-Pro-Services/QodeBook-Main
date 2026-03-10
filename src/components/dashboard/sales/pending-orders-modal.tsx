"use client";

import React from "react";
import { X, Eye, Trash2 } from "lucide-react";
import { OfflineSalesSchema } from "@/components/data-table/offline-sales-table";

type PendingOrder = OfflineSalesSchema;

interface PendingOrdersModalProps {
	isOpen: boolean;
	onClose: () => void;
	orders: PendingOrder[];
	onView: (order: PendingOrder) => void;
	onDelete: (orderId: string) => void;
	title?: string;
}

const PendingOrdersModal: React.FC<PendingOrdersModalProps> = ({
	isOpen,
	onClose,
	orders,
	onView,
	onDelete,
	title = "Pending Orders",
}) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center">
			<div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" onClick={onClose} />
			<div className="relative z-[61] w-[95%] max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b">
					<div>
						<h2 className="text-lg font-semibold">{title}</h2>
						<p className="text-xs text-gray-500">{orders?.length || 0} item(s)</p>
					</div>
					<button
						onClick={onClose}
						className="p-2 rounded hover:bg-gray-100 transition-colors"
						aria-label="Close"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6">
					<div className="grid gap-6">
						{/* Card with Table */}
						<div className="rounded-lg border shadow-sm overflow-hidden">
							<div className="px-4 py-3 bg-gray-50 border-b">
								<div className="text-sm font-medium">Items Awaiting Sync</div>
							</div>
							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead className="bg-gray-100 text-gray-700">
										<tr>
											<th className="px-4 py-2 text-left font-semibold">ID</th>
											<th className="px-4 py-2 text-left font-semibold">Created</th>
											<th className="px-4 py-2 text-left font-semibold">Order Type</th>
											<th className="px-4 py-2 text-left font-semibold">Status</th>
											<th className="px-4 py-2 text-right font-semibold">Total</th>
											<th className="px-4 py-2 text-right font-semibold">Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y">
										{(orders || []).length ? (
											orders.map((o) => {
												const id = o?.id ?? "";
												const created =
													o?.createdAt ||
													new Date().toISOString();
												const orderType =
													o?.order_type ||
													"retail";
												const status = o?.status || "pending_sync";
												const total = o?.payments?.length > 1 ? o?.payments?.map(val => val?.amount)?.reduce((prev, val) => prev += 0, 0) : o?.payments?.[0]?.amount; 
													"0";

												return (
													<tr key={id}>
														<td className="px-4 py-2 align-middle">
															<span className="font-medium">{String(id)}</span>
														</td>
														<td className="px-4 py-2 align-middle">
															{new Date(created)?.toLocaleString()}
														</td>
														<td className="px-4 py-2 align-middle capitalize">
															{String(orderType).replace(/\_/g, " ")}
														</td>
														<td className="px-4 py-2 align-middle">
															<span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-700">
																{String(status)}
															</span>
														</td>
														<td className="px-4 py-2 align-middle text-right">
															{new Intl.NumberFormat("en-NG", {
																style: "currency",
																currency: "NGN",
															}).format(parseFloat(String(total || "0")) || 0)}
														</td>
														<td className="px-4 py-2 align-middle">
															<div className="flex justify-end gap-2">
																<button
																	onClick={() => onView(o)}
																	className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-template-primary text-white hover:bg-template-primary/90"
																>
																	<Eye className="w-4 h-4" />
																	View details
																</button>
																<button
																	onClick={() => onDelete(String(id))}
																	className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100"
																>
																	<Trash2 className="w-4 h-4" />
																	Delete
																</button>
															</div>
														</td>
													</tr>
												);
											})
										) : (
											<tr>
												<td
													className="px-4 py-8 text-center text-gray-500"
													colSpan={6}
												>
													No pending orders found.
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="flex items-center justify-end gap-2 px-6 py-4 border-t">
					<button
						onClick={onClose}
						className="px-4 py-2 rounded-md text-sm border hover:bg-gray-50"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
};

export default PendingOrdersModal;


