import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

export const StatsModal: React.FC = () => {
    const { isGameOver, balance } = useGameStore();
    const [showModal, setShowModal] = React.useState(false);

    React.useEffect(() => {
        if (isGameOver) {
            // Delay showing the modal by 4 seconds to let player see the outcome
            const timer = setTimeout(() => {
                setShowModal(true);
            }, 4000);
            return () => clearTimeout(timer);
        } else {
            setShowModal(false);
        }
    }, [isGameOver]);

    if (!showModal) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gray-900 rounded-xl p-8 border-2 border-red-500 shadow-2xl max-w-md w-full text-center"
                >
                    <h2 className="text-4xl font-bold text-red-500 mb-4">GAME OVER</h2>
                    <p className="text-white text-lg mb-6">You have run out of funds.</p>

                    <div className="bg-gray-800 rounded p-4 mb-6">
                        <div className="text-gray-400 text-sm">Final Balance</div>
                        <div className="text-2xl font-mono text-white">${balance}</div>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-lg transition-transform hover:scale-105"
                    >
                        START NEW CAREER
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
