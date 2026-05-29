import { Resend } from "resend";
import "dotenv/config";

export const emailRecuperacion = (email: string, enlace: string) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  resend.emails.send({
    from: "DashboardFP <contacto@aywebstudio.com>",
    to: email,
    subject: "Recuperación de contraseña",
    html: `<p>Da clic en el siguiente enlace para recuperar tu contraseña, el enlace es valido durante 15 minutos</p> <a href=${enlace}>Reestablecer contraseña</a>`,
  });
};

export const emailVerificacion = (email: string, enlace: string) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  resend.emails.send({
    from: "DashboardFP <contacto@aywebstudio.com>",
    to: email,
    subject: "Verificación de correo electrónico",
    html: `<p>Bienvenido a DashBoardFP por favor da clic en el siguiente enlace para verificar tu correo electrónico y poder hacer uso de tu cuenta con normalidad</p> <a href=${enlace}>Verificar email</a>`,
  });
};
