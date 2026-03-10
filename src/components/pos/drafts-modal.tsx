/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import React from "react";
import { PiXBold, PiFolderOpenBold, PiTrashBold, PiClockBold, PiPackageBold } from "react-icons/pi";
import { motion, AnimatePresence } from "framer-motion";

interface DraftsModalProps {
    isOpen: boolean;
    onClose: () => void;
    drafts: any[];
    onLoadDraft: (draft: any) => void;
    onDeleteDraft: (draftId: string) => void;
}

const DraftsModal: React.FC<DraftsModalProps> = ({
    isOpen,
    onClose,
    drafts,
    onLoadDraft,
    onDeleteDraft
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[80vh]"
            >
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Saved Drafts</h2>
                        <p className="text-sm text-gray-500 font-medium">Continue where you left off</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <PiXBold size={24} className="text-gray-400" />
                    </button>
                </div>

                {/* Drafts List */}
                <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar">
                    {drafts.length > 0 ? (
                        drafts.slice().reverse().map((draft) => (
                            <div
                                key={draft.id}
                                className="group bg-gray-50/50 rounded-2xl border border-gray-100 p-5 hover:border-template-primary/30 hover:bg-white hover:shadow-xl transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:border-template-primary/20 transition-colors">
                                            <PiPackageBold className="text-template-primary/60" size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                                {draft.cart?.length || 0} Items
                                                <span className="text-[10px] bg-template-primary/10 text-template-primary px-2 py-0.5 rounded-full font-black uppercase">
                                                    Draft
                                                </span>
                                            </h4>
                                            <p className="text-xs text-gray-400 font-bold flex items-center gap-1.5 mt-0.5">
                                                <PiClockBold size={12} />
                                                {new Date(draft.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                onLoadDraft(draft);
                                                onClose();
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-template-primary text-white rounded-xl text-xs font-black shadow-lg shadow-template-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            <PiFolderOpenBold size={16} />
                                            LOAD
                                        </button>
                                        <button
                                            onClick={() => onDeleteDraft(draft.id)}
                                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            title="Delete Draft"
                                        >
                                            <PiTrashBold size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center opacity-50">
                            <PiFolderOpenBold size={64} className="text-gray-200 mb-4" />
                            <h3 className="text-lg font-bold text-gray-900">No Drafts Found</h3>
                            <p className="text-sm text-gray-400 max-w-[240px]">You haven&apos;t saved any order drafts yet.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 bg-gray-50/50 border-t border-gray-100 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full h-14 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default DraftsModal;
