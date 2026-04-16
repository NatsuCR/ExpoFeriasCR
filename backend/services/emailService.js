const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Crear transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verificar que el transportador pueda conectar
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️  Email Service not fully configured:', error.message);
  } else {
    console.log('✅ Email Service ready');
  }
});

const emailService = {
  /**
   * Enviar código de reset de contraseña
   */
  enviarCodigoReset: async (email, nombre, codigo) => {
    try {
      const result = await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Código para recuperar tu contraseña - ExpoFeriasCR',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c1a0e;">Recupera tu contraseña</h2>
            <p>Hola <strong>${nombre}</strong>,</p>
            <p>Recibimos una solicitud para recuperar tu contraseña en ExpoFeriasCR. Usa el siguiente código:</p>

            <div style="background-color: #f4e4c1; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <p style="font-size: 32px; font-weight: bold; color: #8b5a2b; letter-spacing: 5px; margin: 0;">${codigo}</p>
            </div>

            <p><strong>Este código expira en 30 minutos.</strong></p>
            <p>Si no solicitaste esto, ignora este correo.</p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              © ExpoFeriasCR ${new Date().getFullYear()} - Todos los derechos reservados
            </p>
          </div>
        `
      });
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error al enviar código reset:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Enviar confirmación de email después del registro
   */
  enviarConfirmacionEmail: async (email, nombre, linkConfirmacion) => {
    try {
      const result = await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Confirma tu correo - ExpoFeriasCR',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c1a0e;">¡Bienvenido a ExpoFeriasCR!</h2>
            <p>Hola <strong>${nombre}</strong>,</p>
            <p>Gracias por registrarte. Para activar tu cuenta, confirma tu correo haciendo clic en el botón:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${linkConfirmacion}" style="background-color: #8b5a2b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Confirmar Email
              </a>
            </div>

            <p style="color: #666; font-size: 12px;">O copia este enlace: <br>${linkConfirmacion}</p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              © ExpoFeriasCR ${new Date().getFullYear()} - Todos los derechos reservados
            </p>
          </div>
        `
      });
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error al enviar confirmación:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Notificar evento creado y pendiente de aprobación
   */
  notificarEventoCreado: async (email, nombre, nombreEvento, idEvento) => {
    try {
      const result = await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: `Tu evento "${nombreEvento}" está siendo revisado`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c1a0e;">¡Evento recibido!</h2>
            <p>Hola <strong>${nombre}</strong>,</p>
            <p>Tu evento <strong>"${nombreEvento}"</strong> ha sido recibido exitosamente.</p>

            <div style="background-color: #f0f2f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Estado:</strong> En revisión</p>
              <p style="margin: 10px 0;"><strong>Tiempo estimado:</strong> 24 a 72 horas</p>
              <p style="margin: 10px 0;"><strong>ID del evento:</strong> ${idEvento}</p>
            </div>

            <p>Nuestro equipo revisará todos los detalles. Te notificaremos cuando esté aprobado o si necesitamos más información.</p>

            <p>Puedes ver el estado en tu cuenta: <a href="${process.env.APP_URL || 'http://localhost:3000'}/mi-cuenta.html">Mi Cuenta</a></p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              © ExpoFeriasCR ${new Date().getFullYear()} - Todos los derechos reservados
            </p>
          </div>
        `
      });
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error al notificar evento creado:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Notificar aprobación de evento
   */
  notificarAprobacion: async (email, nombre, nombreEvento, idEvento, slugEvento) => {
    try {
      const miCuentaLink = `${process.env.APP_URL || 'http://localhost:3000'}/mi-cuenta.html`;
      const result = await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: `¡Tu evento "${nombreEvento}" fue aprobado!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #27ae60;">¡Tu evento fue aprobado!</h2>
            <p>Hola <strong>${nombre}</strong>,</p>
            <p>¡Excelentes noticias! Tu evento <strong>"${nombreEvento}"</strong> ha sido aprobado y ya está visible para todos.</p>

            <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60;">
              <p style="margin: 10px 0; color: #27ae60;"><strong>✓ Estado: APROBADO</strong></p>
              <p style="margin: 10px 0;">Tu evento ya está visible en ExpoFeriasCR</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${miCuentaLink}" style="background-color: #0033A0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Ir a mi cuenta
              </a>
            </div>

            <p>¿Necesitas hacer cambios? Accede a tu cuenta para editar los detalles.</p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              © ExpoFeriasCR ${new Date().getFullYear()} - Todos los derechos reservados
            </p>
          </div>
        `
      });
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error al notificar aprobación:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Notificar rechazo de evento
   */
  notificarRechazo: async (email, nombre, nombreEvento, razonRechazo) => {
    try {
      const msCuentaLink = `${process.env.APP_URL || 'http://localhost:3000'}/mi-cuenta.html`;
      const result = await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: `Tu evento "${nombreEvento}" requiere cambios`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e74c3c;">Tu evento requiere cambios</h2>
            <p>Hola <strong>${nombre}</strong>,</p>
            <p>Revisamos tu evento <strong>"${nombreEvento}"</strong> y detectamos algunos puntos que necesitan mejoras.</p>

            <div style="background-color: #fadbd8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e74c3c;">
              <h4 style="margin-top: 0; color: #c0392b;">Razón del cambio solicitado:</h4>
              <p style="margin: 10px 0; line-height: 1.6;">${razonRechazo}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${msCuentaLink}" style="background-color: #0033A0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Editar tu evento
              </a>
            </div>

            <p>Realiza los cambios necesarios y vuelve a enviar tu evento. Nuestro equipo lo revisará nuevamente.</p>
            <p style="color: #666; font-size: 13px;">¿Preguntas? Contacta con nuestro equipo de soporte.</p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              © ExpoFeriasCR ${new Date().getFullYear()} - Todos los derechos reservados
            </p>
          </div>
        `
      });
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error al notificar rechazo:', error);
      return { success: false, error: error.message };
    }
  }
};

module.exports = emailService;
