'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, ExternalLink, Facebook } from 'lucide-react';

// ─────────────────────────────────────────────────────────
// MODO LOCAL: datos de ejemplo que simulan posts reales
// En producción, esto vendría de:
//   GET https://graph.facebook.com/v19.0/{page-id}/posts
//       ?fields=message,full_picture,created_time,permalink_url,attachments
//       &access_token={PAGE_ACCESS_TOKEN}
// ─────────────────────────────────────────────────────────

const MOCK_POSTS = [
    {
        id: '1',
        message: '🍕 ¡Nueva pizza en el menú! Probaste nuestra HAWAIANA ESPECIAL con jamón artesanal, piña natural y queso extra derretido. Disponible toda la semana. ¡Pide la tuya ahora!',
        full_picture: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
        created_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        permalink_url: 'https://www.facebook.com',
        likes: 87,
        comments: 14,
        shares: 9,
    },
    {
        id: '2',
        message: '🔥 PROMOCIÓN DE VIERNES\n2 pizzas medianas + refresco 2L = $199\nSolo válido hoy viernes. Pide en línea o llama al 846-123-4567.\n¡No te quedes sin la tuya! 🍕❤️',
        full_picture: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80',
        created_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        permalink_url: 'https://www.facebook.com',
        likes: 143,
        comments: 31,
        shares: 22,
    },
    {
        id: '3',
        message: '✨ Gracias por su preferencia. 5 años llevando el mejor sabor a domicilio en Pánuco, Veracruz. ¡Los queremos mucho! Recuerden que tenemos servicio de lunes a domingo 10am a 10pm. 🙏',
        full_picture: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
        created_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        permalink_url: 'https://www.facebook.com',
        likes: 215,
        comments: 48,
        shares: 17,
    },
];

// ─── Cuando tengas el token real, activa esto: ───────────
// const PAGE_ID = 'TU_PAGE_ID';
// const ACCESS_TOKEN = process.env.NEXT_PUBLIC_FB_ACCESS_TOKEN;
// async function fetchRealPosts() {
//     const res = await fetch(
//         `https://graph.facebook.com/v19.0/${PAGE_ID}/posts` +
//         `?fields=message,full_picture,created_time,permalink_url` +
//         `&limit=6&access_token=${ACCESS_TOKEN}`
//     );
//     const data = await res.json();
//     return data.data;
// }
// ─────────────────────────────────────────────────────────

function timeAgo(iso: string) {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} días`;
    return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
}

function PostCard({ post, index }: { post: typeof MOCK_POSTS[0]; index: number }) {
    const [liked, setLiked] = useState(false);
    const lines = post.message.split('\n');

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="bg-[#0f172a] border border-white/5 rounded-[2rem] overflow-hidden hover:border-capriccio-gold/20 transition-all duration-300 group"
        >
            {/* Imagen */}
            {post.full_picture && (
                <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                        src={post.full_picture}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
                </div>
            )}

            {/* Contenido */}
            <div className="p-5">
                {/* Mensaje */}
                <div className="text-slate-300 text-sm font-medium leading-relaxed mb-4 space-y-1">
                    {lines.map((line, i) => (
                        <p key={i}>{line}</p>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    {/* Reacciones */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setLiked(v => !v)}
                            className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${liked ? 'text-red-400' : 'text-slate-500 hover:text-red-400'}`}
                        >
                            <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
                            {post.likes + (liked ? 1 : 0)}
                        </button>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                            <MessageCircle size={14} />
                            {post.comments}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                            <Share2 size={14} />
                            {post.shares}
                        </span>
                    </div>

                    {/* Tiempo + ver más */}
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-600 font-bold">{timeAgo(post.created_time)}</span>
                        <a
                            href={post.permalink_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-capriccio-gold hover:text-yellow-400 transition-colors"
                        >
                            <ExternalLink size={13} />
                        </a>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function FacebookFeed() {
    return (
        <section className="py-20 bg-slate-950">
            <div className="container mx-auto px-6">

                {/* Header de sección */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-[#1877F2] rounded-xl flex items-center justify-center shrink-0">
                                <Facebook size={16} className="text-white" fill="white" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Síguenos</span>
                        </div>
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
                            Lo Último de <span className="text-capriccio-gold">Capriccio</span>
                        </h2>
                        <p className="text-slate-500 text-sm font-bold mt-2">Promos, novedades y más directo desde nuestro Facebook</p>
                    </div>
                    <a
                        href="https://www.facebook.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap"
                    >
                        <Facebook size={14} fill="currentColor" />
                        Ver página
                    </a>
                </div>

                {/* Grid de posts */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_POSTS.map((post, i) => (
                        <PostCard key={post.id} post={post} index={i} />
                    ))}
                </div>

                {/* Badge modo demo */}
                <div className="mt-8 flex justify-center">
                    <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                        Vista previa local — conectar con Facebook Graph API para posts reales
                    </span>
                </div>

            </div>
        </section>
    );
}
