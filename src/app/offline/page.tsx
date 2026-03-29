'use client';

export default function OfflinePage() {
    return (
        <html lang="es">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>Sin conexión – Capriccio Pizzería</title>
                <style>{`
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        background: #0f172a;
                        color: white;
                        font-family: system-ui, -apple-system, sans-serif;
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 24px;
                        text-align: center;
                    }
                    .container { max-width: 360px; }
                    .logo { height: 60px; width: auto; margin: 0 auto 32px; display: block; }
                    .emoji { font-size: 64px; margin-bottom: 20px; }
                    h1 { font-size: 28px; font-weight: 900; font-style: italic; text-transform: uppercase;
                         letter-spacing: -0.03em; margin-bottom: 12px; }
                    p { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.6; margin-bottom: 32px; }
                    .gold { color: #d4a017; }
                    button {
                        background: #d4a017;
                        color: #0f172a;
                        border: none;
                        padding: 16px 32px;
                        border-radius: 16px;
                        font-size: 14px;
                        font-weight: 900;
                        text-transform: uppercase;
                        letter-spacing: 0.1em;
                        cursor: pointer;
                        width: 100%;
                        transition: background 0.2s;
                    }
                    button:hover { background: #e5b020; }
                    .divider { margin: 24px 0; border-top: 1px solid rgba(255,255,255,0.08); }
                    .tel { color: #d4a017; text-decoration: none; font-weight: 700; font-size: 20px; display: block; margin-top: 16px; }
                `}</style>
            </head>
            <body>
                <div className="container">
                    <img src="/logohd.png" alt="Capriccio" className="logo" />
                    <div className="emoji">🍕</div>
                    <h1>Sin <span className="gold">conexión</span></h1>
                    <p>
                        Parece que no tienes internet en este momento.<br />
                        Revisa tu conexión e intenta de nuevo, o llámanos directamente.
                    </p>
                    <button onClick={() => window.location.reload()}>
                        🔄 Reintentar
                    </button>
                    <div className="divider" />
                    <p style={{ marginBottom: 0 }}>¿Quieres hacer un pedido ahora?</p>
                    <a href="tel:8461234567" className="tel">📞 846-123-4567</a>
                </div>
            </body>
        </html>
    );
}
