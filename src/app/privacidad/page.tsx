import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Aviso de Privacidad',
    description: 'Aviso de Privacidad de Capriccio Pizzería conforme a la LFPDPPP.',
};

export default function PrivacidadPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="max-w-3xl mx-auto px-6 py-16">

                <Link href="/" className="text-capriccio-gold text-xs font-black uppercase tracking-widest hover:underline mb-10 inline-block">
                    ← Volver al inicio
                </Link>

                <img src="/logohd.png" alt="Capriccio Pizzería" className="h-14 w-auto mb-8" />

                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
                    Aviso de Privacidad
                </h1>
                <p className="text-slate-400 text-sm font-bold mb-10">
                    Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                <div className="space-y-8 text-slate-300 leading-relaxed">

                    <section>
                        <h2 className="text-white font-black uppercase tracking-widest text-xs mb-3 text-capriccio-gold">1. Responsable del Tratamiento</h2>
                        <p>
                            <strong className="text-white">Capriccio Pizzería</strong>, con domicilio en Pánuco, Veracruz, México,
                            es responsable del tratamiento de sus datos personales, de conformidad con lo establecido en la
                            <em> Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</em> y su Reglamento.
                        </p>
                        <p className="mt-2">Contacto para asuntos de privacidad: <a href="tel:8461234567" className="text-capriccio-gold hover:underline">846-123-4567</a></p>
                    </section>

                    <section>
                        <h2 className="text-white font-black uppercase tracking-widest text-xs mb-3 text-capriccio-gold">2. Datos Personales que Recabamos</h2>
                        <p>Para la realización de pedidos y prestación de nuestros servicios, recabamos los siguientes datos personales:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
                            <li>Nombre completo</li>
                            <li>Número de teléfono</li>
                            <li>Dirección de entrega</li>
                            <li>Referencias de ubicación</li>
                            <li>Historial de pedidos</li>
                            <li>Coordenadas de geolocalización (solo si el usuario lo autoriza expresamente)</li>
                        </ul>
                        <p className="mt-3 text-sm">
                            No recabamos datos personales sensibles como información financiera, de salud o biométrica.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-black uppercase tracking-widest text-xs mb-3 text-capriccio-gold">3. Finalidades del Tratamiento</h2>
                        <p className="font-bold text-white text-sm mb-2">Finalidades primarias (necesarias para el servicio):</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-400">
                            <li>Procesar y gestionar su pedido de alimentos</li>
                            <li>Coordinar la entrega a domicilio</li>
                            <li>Contactarle en caso de dudas sobre su pedido</li>
                            <li>Registro de historial de pedidos para su conveniencia</li>
                        </ul>
                        <p className="font-bold text-white text-sm mt-4 mb-2">Finalidades secundarias (puede oponerse):</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-400">
                            <li>Envío de promociones y descuentos especiales</li>
                            <li>Encuestas de satisfacción del servicio</li>
                        </ul>
                        <p className="mt-3 text-sm">
                            Si no desea que sus datos sean tratados para las finalidades secundarias, puede comunicarlo
                            al teléfono <a href="tel:8461234567" className="text-capriccio-gold hover:underline">846-123-4567</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-black uppercase tracking-widest text-xs mb-3 text-capriccio-gold">4. Transferencia de Datos</h2>
                        <p>
                            Sus datos personales <strong className="text-white">no serán transferidos</strong> a terceros sin su consentimiento,
                            salvo en los casos previstos en el artículo 37 de la LFPDPPP (autoridades competentes que lo requieran
                            por disposición legal).
                        </p>
                        <p className="mt-2">
                            Para la prestación del servicio de entrega, su dirección es compartida únicamente con el repartidor
                            asignado a su pedido.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-black uppercase tracking-widest text-xs mb-3 text-capriccio-gold">5. Derechos ARCO</h2>
                        <p>
                            Usted tiene derecho a <strong className="text-white">Acceder, Rectificar, Cancelar u Oponerse</strong> (derechos ARCO)
                            al tratamiento de sus datos personales. Para ejercer estos derechos:
                        </p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
                            <li>Comuníquese al <a href="tel:8461234567" className="text-capriccio-gold hover:underline">846-123-4567</a></li>
                            <li>Identifíquese con nombre y número de teléfono registrado</li>
                            <li>Indique claramente el derecho que desea ejercer y los datos involucrados</li>
                        </ul>
                        <p className="mt-3 text-sm">
                            Responderemos a su solicitud en un plazo máximo de <strong className="text-white">20 días hábiles</strong>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-black uppercase tracking-widest text-xs mb-3 text-capriccio-gold">6. Cookies y Tecnologías de Seguimiento</h2>
                        <p>
                            Nuestro sitio web utiliza <strong className="text-white">almacenamiento local (localStorage)</strong> únicamente
                            para recordar sus datos de entrega y preferencias de pedido entre sesiones, facilitando así
                            futuras compras. No utilizamos cookies de seguimiento publicitario ni compartimos esta
                            información con redes de publicidad.
                        </p>
                        <p className="mt-2">
                            Puede borrar estos datos en cualquier momento desde la configuración de su navegador
                            (Ajustes → Privacidad → Borrar datos del sitio).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-black uppercase tracking-widest text-xs mb-3 text-capriccio-gold">7. Geolocalización</h2>
                        <p>
                            La función de ubicación automática en el proceso de pedido es <strong className="text-white">completamente opcional</strong>.
                            Su dispositivo le solicitará permiso expresamente antes de acceder a sus coordenadas GPS.
                            Puede denegar este permiso sin que ello afecte su capacidad de realizar pedidos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-black uppercase tracking-widest text-xs mb-3 text-capriccio-gold">8. Seguridad</h2>
                        <p>
                            Implementamos medidas técnicas y organizativas para proteger sus datos personales contra
                            acceso no autorizado, pérdida o alteración, incluyendo comunicaciones cifradas (HTTPS) y
                            acceso restringido a la base de datos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-black uppercase tracking-widest text-xs mb-3 text-capriccio-gold">9. Cambios al Aviso de Privacidad</h2>
                        <p>
                            Nos reservamos el derecho de modificar este aviso. Cualquier cambio será publicado en
                            esta página. Le recomendamos revisarlo periódicamente.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-black uppercase tracking-widest text-xs mb-3 text-capriccio-gold">10. Autoridad Competente</h2>
                        <p>
                            Si considera que su derecho a la protección de datos personales ha sido vulnerado, puede
                            acudir ante el <strong className="text-white">INAI</strong> (Instituto Nacional de Transparencia, Acceso a
                            la Información y Protección de Datos Personales) en{' '}
                            <span className="text-capriccio-gold">www.inai.org.mx</span>.
                        </p>
                    </section>

                </div>

                <div className="mt-16 pt-8 border-t border-slate-800 text-center text-slate-600 text-xs">
                    © {new Date().getFullYear()} Capriccio Pizzería · Pánuco, Veracruz, México
                </div>
            </div>
        </div>
    );
}
