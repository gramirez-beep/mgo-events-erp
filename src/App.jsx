import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps, deleteApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import {
  ShieldCheck, Lock, CheckCircle2, AlertTriangle, Building2, CreditCard,
  PlusCircle, DollarSign, Users, Calendar, MapPin, Check, KeyRound, Layers,
  Wallet, Landmark, Hotel, Trash2, UserPlus, ShieldAlert, TrendingDown,
  TrendingUp, BarChart3, Cloud, Download, LogOut, LogIn, Eye, EyeOff,
  ArrowLeft, FolderOpen, ArrowRight, Globe, Edit3
} from 'lucide-react';

// ============================================================================
// 1. CONFIGURACIÓN DE FIREBASE (LLAVES PROPIAS MGO)
// ============================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBSIy2-TfVCxZUvuVbr6ejDhwKmEwbVvKk",
  authDomain: "mgo-events-sistema.firebaseapp.com",
  projectId: "mgo-events-sistema",
  storageBucket: "mgo-events-sistema.firebasestorage.app",
  messagingSenderId: "768292798090",
  appId: "1:768292798090:web:3199b4c6f7da10e1267773"
};

const appId = 'mgo-events-produccion';
let app = null;
let auth = null;
let db = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
} catch (err) {
  console.warn('Modo almacenamiento local activo:', err);
}

// ============================================================================
// 2. LOGOTIPO OFICIAL MGO — HIGH PERFORMANCE SPORTS LOGISTICS
// ============================================================================
const MGOLogo = ({ size = 'md' }) => {
  const dimensions = size === 'lg' ? 'w-16 h-16' : 'w-11 h-11';
  const titleSize = size === 'lg' ? 'text-4xl' : 'text-2xl';
  const subSize = size === 'lg' ? 'text-xs' : 'text-[10px]';

  return (
    <div className="flex items-center gap-3 select-none">
      <svg viewBox="0 0 120 120" className={`${dimensions} shrink-0 drop-shadow-sm`} fill="none">
        <path d="M12 24 L12 96 L52 60 Z" fill="#0D4F8B" />
        <path d="M12 96 C12 108 26 114 36 104 L104 36 C114 26 108 12 96 12 C88 12 82 16 76 22 L16 82 Z" fill="#118A96" />
        <path d="M72 60 L72 96 C72 106 82 110 90 104 L104 90 L72 58 Z" fill="#F5D34B" />
        <path d="M108 24 L108 96 C108 106 96 112 86 104 C80 99 78 92 78 84 L78 48 Z" fill="#F37338" />
        <path d="M60 60 L92 16 C98 10 108 14 108 24 C108 30 104 36 98 42 L74 74 Z" fill="#EE2743" />
        <path d="M16 16 C24 8 36 10 44 18 L92 66 L74 84 L16 26 C10 20 12 18 16 16 Z" fill="#9B1B60" />
      </svg>
      <div className="leading-none text-left">
        <div className={`${titleSize} font-black tracking-tight flex items-center`}>
          <span style={{ color: '#118A96' }}>M</span>
          <span style={{ color: '#0D4F8B' }}>GO</span>
        </div>
        <div className={`${subSize} font-semibold text-slate-500 tracking-tight mt-0.5`}>
          High Performance<br />Sports Logistics
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. JERARQUÍA DE ROLES Y ÚNICO USUARIO INICIAL OFICIAL (PRESIDENTE)
// ============================================================================
const ROLE_LABELS = {
  PROJECT_MANAGER: 'Project Manager',
  DIRECTOR: 'Director',
  DIRECTOR_GENERAL: 'Director General',
  PRESIDENTE: 'Presidente'
};

const ROLE_RIGHTS_DESCRIPTION = {
  PROJECT_MANAGER: 'Solicitar pagos únicamente en sus eventos asignados y crear eventos nuevos',
  DIRECTOR: '1ra firma de pagos + Acceso a todos los eventos y solicitud de pagos',
  DIRECTOR_GENERAL: '2da firma de pagos + Alta de Cuentas/Tarjetas + Eliminar eventos + Derechos de Director',
  PRESIDENTE: 'Acceso total, Edición de Partidas Presupuestales, Firma Digital, Consulta Ejecutiva y Usuarios'
};

// Único usuario inicial del sistema: gramirez@mgoevents.com (Sin rastro de otros usuarios)
const INITIAL_USERS = [
  {
    id: 'u-pres-gramirez',
    nombre: 'Guillermo Ramírez',
    cargo: 'Presidente del Consejo',
    email: 'gramirez@mgoevents.com',
    rol: 'PRESIDENTE',
    activo: true
  }
];

// Lista de correos/IDs de prueba antiguos para purgarlos automáticamente si quedaron en la nube
const LEGACY_TEST_EMAILS = [
  'pepe@mgoevents.com',
  'manu@mgoevents.com',
  'clarisa@mgoevents.com',
  'presidente@mgoevents.com',
  'carlos@mgoevents.com'
];
const LEGACY_TEST_IDS = ['u1', 'u2', 'u3', 'u4', 'u5'];

const INITIAL_ACCOUNTS = [
  { id: 'acc-1', nombre: 'MGO Digital', bancoEmisor: 'BBVA México', tipoCuenta: 'Cheques', pais: 'México' },
  { id: 'acc-2', nombre: 'Clari Amex', bancoEmisor: 'American Express', tipoCuenta: 'Tarjeta de Crédito', pais: 'México' },
  { id: 'acc-3', nombre: 'Manu 1251', bancoEmisor: 'Banorte', tipoCuenta: 'Tarjeta de Crédito', pais: 'México' },
  { id: 'acc-4', nombre: 'BOFA 9273', bancoEmisor: 'Bank of America', tipoCuenta: 'Tarjeta de Crédito', pais: 'USA' },
  { id: 'acc-5', nombre: 'Amex 4002', bancoEmisor: 'American Express', tipoCuenta: 'Tarjeta de Crédito', pais: 'México' },
  { id: 'acc-6', nombre: 'Manu 4610', bancoEmisor: 'Santander', tipoCuenta: 'Tarjeta de Crédito', pais: 'México' }
];

const INITIAL_EVENTS = [
  {
    id: 'EVT-PARALIMPIADA-2026',
    nombre: 'Inscripciones Paralimpiada',
    cliente: 'CONADE / Comité Paralímpico',
    fechaInicio: '2026-09-07',
    fechaFin: '2026-09-10',
    responsable: 'Guillermo Ramírez',
    moneda: 'MXN',
    estatus: 'En Cierre / Liquidación',
    sedes: [{ id: 'sede-cdmx', ciudad: 'Ciudad de México', hoteles: ['Holiday Inn Dalí'] }],
    rubrosPresupuesto: [
      { id: 'rub-1', categoria: 'Hospedaje', presupuesto: 560000, descripcion: 'Hospedaje, alimentos, tomas de corriente, red y coffee break' },
      { id: 'rub-2', categoria: 'Vuelos de Empleados', presupuesto: 85000, descripcion: 'Vuelos staff MGO e inscripciones' },
      { id: 'rub-3', categoria: 'Materiales y Papelería', presupuesto: 75000, descripcion: 'Tintas HP/Xerox, sellos, pendones y papelería' },
      { id: 'rub-4', categoria: 'Transporte Terrestre', presupuesto: 35000, descripcion: 'Renta camioneta Alamo, gasolina y casetas' },
      { id: 'rub-5', categoria: 'Viáticos de Empleados / Perdiem', presupuesto: 25000, descripcion: 'Alimentación y perdiem equipo operativo' },
      { id: 'rub-6', categoria: 'Fee del Evento', presupuesto: 20000, descripcion: 'Cargos operativos y gestión' },
    ],
    gastos: [
      { id: 'R47', fecha: '2026-09-14', sedeCiudad: 'Ciudad de México', hotel: 'Holiday Inn Dalí', categoria: 'Hospedaje', proveedor: 'Holiday Inn Dali', concepto: 'Inscripciones Paralimpiada', descripcion: 'Hospedaje, alimentos, tomas de corriente, conexion de red y coffee break', monto: 527256.44, formaPago: 'Transferencia', cuenta: 'MGO Digital', pagadoPor: 'MGO', solicitadoPor: 'MGO', comprobante: 'Factura', authDirOp: true, authDirGen: true, firmaPresidente: true, selloDigital: 'MGO-SIG-948201-PRES', estatus: 'Pagado' },
      { id: 'R48', fecha: '2026-09-02', sedeCiudad: 'Ciudad de México', hotel: 'Holiday Inn Dalí', categoria: 'Vuelos de Empleados', proveedor: 'Aeromexico', concepto: 'Vuelos MGO', descripcion: 'Clave reserva GNPFIM', monto: 21152.00, formaPago: 'Tarjeta Corporativa', cuenta: 'Clari Amex', pagadoPor: 'MGO', solicitadoPor: 'MGO', comprobante: 'Factura', authDirOp: true, authDirGen: true, firmaPresidente: true, selloDigital: 'MGO-SIG-948202-PRES', estatus: 'Pagado' },
      { id: 'R49', fecha: '2026-09-04', sedeCiudad: 'Ciudad de México', hotel: 'Holiday Inn Dalí', categoria: 'Materiales y Papelería', proveedor: 'Papelerias Bety', concepto: 'Papeleria', descripcion: 'Papelería general para registro', monto: 7793.35, formaPago: 'Tarjeta Corporativa', cuenta: 'Manu 1251', pagadoPor: 'MGO', solicitadoPor: 'MGO', comprobante: 'Factura', authDirOp: true, authDirGen: true, firmaPresidente: true, selloDigital: 'MGO-SIG-948203-PRES', estatus: 'Pagado' },
      { id: 'R50', fecha: '2026-09-04', sedeCiudad: 'Ciudad de México', hotel: 'Holiday Inn Dalí', categoria: 'Materiales y Papelería', proveedor: 'Office Depot', concepto: 'Tintas de impresora', descripcion: '36 cartuchos Impresoras HP', monto: 24174.00, formaPago: 'Tarjeta Corporativa', cuenta: 'Manu 1251', pagadoPor: 'MGO', solicitadoPor: 'MGO', comprobante: 'Factura', authDirOp: true, authDirGen: true, firmaPresidente: true, selloDigital: 'MGO-SIG-948204-PRES', estatus: 'Pagado' },
      { id: 'R51', fecha: '2026-09-07', sedeCiudad: 'Ciudad de México', hotel: 'Holiday Inn Dalí', categoria: 'Materiales y Papelería', proveedor: 'FAMA COLOR', concepto: 'Papeleria', descripcion: '20 Sellos y Pendones oficiales', monto: 11843.02, formaPago: 'Tarjeta Corporativa', cuenta: 'Manu 1251', pagadoPor: 'MGO', solicitadoPor: 'MGO', comprobante: 'Factura', authDirOp: true, authDirGen: true, firmaPresidente: true, selloDigital: 'MGO-SIG-948205-PRES', estatus: 'Pagado' },
      { id: 'R52', fecha: '2026-09-03', sedeCiudad: 'Ciudad de México', hotel: 'Holiday Inn Dalí', categoria: 'Materiales y Papelería', proveedor: 'Mercado Libre', concepto: 'Tintas de impresora', descripcion: '5 Tintas Impresoras Xerox', monto: 16820.29, formaPago: 'Tarjeta Corporativa', cuenta: 'BOFA 9273', pagadoPor: 'MGO', solicitadoPor: 'MGO', comprobante: 'Factura', authDirOp: true, authDirGen: true, firmaPresidente: true, selloDigital: 'MGO-SIG-948206-PRES', estatus: 'Pagado' },
      { id: 'R53', fecha: '2026-09-07', sedeCiudad: 'Ciudad de México', hotel: 'Holiday Inn Dalí', categoria: 'Vuelos de Empleados', proveedor: 'Viva Aerobus', concepto: 'Vuelos Paralimpiada', descripcion: 'Vuelo David, Maria Guadalupe y Leslie', monto: 16080.61, formaPago: 'Tarjeta Corporativa', cuenta: 'Clari Amex', pagadoPor: 'MGO', solicitadoPor: 'MGO', comprobante: 'Factura', authDirOp: true, authDirGen: true, firmaPresidente: true, selloDigital: 'MGO-SIG-948207-PRES', estatus: 'Pagado' },
      { id: 'R54', fecha: '2026-09-07', sedeCiudad: 'Ciudad de México', hotel: 'Holiday Inn Dalí', categoria: 'Vuelos de Empleados', proveedor: 'Aeromexico', concepto: 'Vuelos Paralimpiada', descripcion: 'Vuelo Anaisa, Jose Israel y Diana', monto: 20874.00, formaPago: 'Tarjeta Corporativa', cuenta: 'Clari Amex', pagadoPor: 'MGO', solicitadoPor: 'MGO', comprobante: 'Factura', authDirOp: true, authDirGen: true, firmaPresidente: true, selloDigital: 'MGO-SIG-948208-PRES', estatus: 'Pagado' },
      { id: 'R55', fecha: '2026-09-17', sedeCiudad: 'Ciudad de México', hotel: 'Holiday Inn Dalí', categoria: 'Transporte Terrestre', proveedor: 'Alamo', concepto: 'Inscripciones Guadalajara - Mexico', descripcion: 'Renta vehículo para llevar impresora', monto: 12499.99, formaPago: 'Tarjeta Corporativa', cuenta: 'Amex 4002', pagadoPor: 'MGO', solicitadoPor: 'MGO', comprobante: 'Factura', authDirOp: true, authDirGen: true, firmaPresidente: true, selloDigital: 'MGO-SIG-948209-PRES', estatus: 'Pagado' },
      { id: 'R56', fecha: '2026-09-12', sedeCiudad: 'Ciudad de México', hotel: 'Holiday Inn Dalí', categoria: 'Transporte Terrestre', proveedor: 'Gasolina', concepto: 'Arturo CONADE', descripcion: 'Transporte para inscripciones', monto: 600.00, formaPago: 'Efectivo / Reembolso', cuenta: 'Cash', pagadoPor: 'MGO', solicitadoPor: 'MGO', comprobante: 'Factura', authDirOp: true, authDirGen: true, firmaPresidente: true, selloDigital: 'MGO-SIG-948210-PRES', estatus: 'Pagado' },
      { id: 'R57', fecha: '2026-09-10', sedeCiudad: 'Ciudad de México', hotel: 'Holiday Inn Dalí', categoria: 'Materiales y Papelería', proveedor: 'Papeleria', concepto: 'Papeleria Extra', descripcion: 'Insumos urgentes en sede', monto: 691.00, formaPago: 'Efectivo / Reembolso', cuenta: 'Cash', pagadoPor: 'MGO', solicitadoPor: 'MGO', comprobante: 'Recibo', authDirOp: true, authDirGen: true, firmaPresidente: true, selloDigital: 'MGO-SIG-948211-PRES', estatus: 'Pagado' },
      { id: 'R58', fecha: '2026-09-06', sedeCiudad: 'Ciudad de México', hotel: 'Holiday Inn Dalí', categoria: 'Transporte Terrestre', proveedor: 'Casetas', concepto: 'Casetas MGO', descripcion: 'Peajes traslado equipo Guadalajara - CDMX', monto: 2308.00, formaPago: 'Efectivo / Reembolso', cuenta: 'Cash', pagadoPor: 'MGO', solicitadoPor: 'MGO', comprobante: 'Factura', authDirOp: true, authDirGen: true, firmaPresidente: true, selloDigital: 'MGO-SIG-948212-PRES', estatus: 'Pagado' },
      { id: 'R59', fecha: '2026-09-06', sedeCiudad: 'Ciudad de México', hotel: 'Holiday Inn Dalí', categoria: 'Transporte Terrestre', proveedor: 'Gasolina', concepto: 'Gasolina MGO', descripcion: 'Carga combustible traslado equipo', monto: 4647.85, formaPago: 'Efectivo / Reembolso', cuenta: 'Cash', pagadoPor: 'MGO', solicitadoPor: 'MGO', comprobante: 'Factura', authDirOp: true, authDirGen: true, firmaPresidente: true, selloDigital: 'MGO-SIG-948213-PRES', estatus: 'Pagado' },
      { id: 'R60', fecha: '2026-09-06', sedeCiudad: 'Ciudad de México', hotel: 'Holiday Inn Dalí', categoria: 'Vuelos de Empleados', proveedor: 'Volaris', concepto: 'Vuelos Operativos', descripcion: 'Boleto aéreo supervisión operativa', monto: 2692.00, formaPago: 'Tarjeta Corporativa', cuenta: 'Manu 4610', pagadoPor: 'MGO', solicitadoPor: 'MGO', comprobante: 'Factura', authDirOp: true, authDirGen: true, firmaPresidente: true, selloDigital: 'MGO-SIG-948214-PRES', estatus: 'Pagado' },
      { id: 'R61-PEND', fecha: '2026-09-18', sedeCiudad: 'Ciudad de México', hotel: 'Holiday Inn Dalí', categoria: 'Viáticos de Empleados / Perdiem', proveedor: 'Perdiem Staff Operativo', concepto: 'Liquidación Viáticos Cierre CDMX', descripcion: 'Perdiem 6 integrantes staff cierre de evento', monto: 14500.00, formaPago: 'Transferencia', cuenta: 'MGO Digital', pagadoPor: 'MGO', solicitadoPor: 'MGO', comprobante: 'Recibo', authDirOp: true, authDirGen: false, firmaPresidente: false, selloDigital: null, estatus: 'Pendiente Autorización' },
      { id: 'R62-PEND', fecha: '2026-09-18', sedeCiudad: 'Ciudad de México', hotel: 'Holiday Inn Dalí', categoria: 'Fee del Evento', proveedor: 'Auditoria & Logística Deportiva SC', concepto: 'Honorarios Cierre Documental CONADE', descripcion: 'Entrega de carpetas y actas de cierre', monto: 18000.00, formaPago: 'Transferencia', cuenta: 'MGO Digital', pagadoPor: 'MGO', solicitadoPor: 'MGO', comprobante: 'Factura', authDirOp: true, authDirGen: true, firmaPresidente: false, selloDigital: null, estatus: 'Listo para Firma Presidente' }
    ]
  },
  {
    id: 'EVT-OLIMPIADA-NAC-2026',
    nombre: 'Olimpiada Nacional de México 2026',
    cliente: 'CONADE / Institutos Estatales del Deporte',
    fechaInicio: '2026-10-15',
    fechaFin: '2026-11-05',
    responsable: 'Guillermo Ramírez',
    moneda: 'MXN',
    estatus: 'En Operación Activa',
    sedes: [
      { id: 'sede-gdl', ciudad: 'Guadalajara, Jal.', hoteles: ['Hotel RIU Plaza Guadalajara', 'Hard Rock Hotel Guadalajara', 'Fiesta Americana Minerva'] },
      { id: 'sede-mty', ciudad: 'Monterrey, N.L.', hoteles: ['Camino Real Monterrey', 'Safi Royal Luxury Valle'] },
      { id: 'sede-mid', ciudad: 'Mérida, Yuc.', hoteles: ['Fiesta Americana Mérida', 'Holiday Inn Mérida'] }
    ],
    rubrosPresupuesto: [
      { id: 'on-1', categoria: 'Hospedaje', presupuesto: 2800000, descripcion: 'Bloqueo de habitaciones atletas, jueces y comité en 3 ciudades' },
      { id: 'on-2', categoria: 'Alimentación', presupuesto: 950000, descripcion: 'Comedores deportivos y buffets en hoteles sede' },
      { id: 'on-3', categoria: 'Transporte Terrestre', presupuesto: 620000, descripcion: 'Autobuses aeropuerto-hotel-sede deportiva y vanes VIP' },
      { id: 'on-4', categoria: 'Vuelos de Jueces', presupuesto: 480000, descripcion: 'Boletos aéreos jueces nacionales e internacionales' },
      { id: 'on-5', categoria: 'Vuelos de Empleados', presupuesto: 210000, descripcion: 'Staff MGO asignado a Guadalajara, Monterrey y Mérida' },
      { id: 'on-6', categoria: 'Perdiem', presupuesto: 340000, descripcion: 'Perdiem diario para jueces y delegados técnicos' },
      { id: 'on-7', categoria: 'Viáticos de Empleados', presupuesto: 190000, descripcion: 'Viáticos coordinadores de sede MGO' },
      { id: 'on-8', categoria: 'Fee del Evento', presupuesto: 650000, descripcion: 'Fee de agencia y operación logística integral MGO Events' },
    ],
    gastos: [
      { id: 'ON-101', fecha: '2026-10-02', sedeCiudad: 'Guadalajara, Jal.', hotel: 'Hotel RIU Plaza Guadalajara', categoria: 'Hospedaje', proveedor: 'RIU Hotels & Resorts', concepto: 'Anticipo 50% Bloqueo Delegaciones y Jueces', descripcion: '220 habitaciones plan pensión completa', monto: 1250000.00, formaPago: 'Transferencia', cuenta: 'MGO Digital', pagadoPor: 'MGO', solicitadoPor: 'MGO', comprobante: 'Factura', authDirOp: true, authDirGen: true, firmaPresidente: true, selloDigital: 'MGO-SIG-88101-PRES', estatus: 'Pagado' },
      { id: 'ON-102', fecha: '2026-10-04', sedeCiudad: 'Monterrey, N.L.', hotel: 'Camino Real Monterrey', categoria: 'Hospedaje', proveedor: 'Hoteles Camino Real', concepto: 'Liquidación Hospedaje Jueces Federación', descripcion: '85 habitaciones sede Monterrey', monto: 680000.00, formaPago: 'Transferencia', cuenta: 'MGO Digital', pagadoPor: 'MGO', solicitadoPor: 'MGO', comprobante: 'Factura', authDirOp: true, authDirGen: true, firmaPresidente: true, selloDigital: 'MGO-SIG-88102-PRES', estatus: 'Pagado' },
      { id: 'ON-103', fecha: '2026-10-06', sedeCiudad: 'Mérida, Yuc.', hotel: 'Fiesta Americana Mérida', categoria: 'Vuelos de Jueces', proveedor: 'Aeromexico Grupos', concepto: 'Emisión 42 Boletos Jueces Nacionales', descripcion: 'Rutas CDMX-MID y GDL-MID', monto: 264500.00, formaPago: 'Tarjeta Corporativa', cuenta: 'Clari Amex', pagadoPor: 'MGO', solicitadoPor: 'MGO', comprobante: 'Factura', authDirOp: true, authDirGen: true, firmaPresidente: false, selloDigital: null, estatus: 'Listo para Firma Presidente' }
    ]
  }
];

const RUBROS_SUGERIDOS = [
  'Hospedaje', 'Alimentación', 'Transporte Terrestre', 'Fee del Evento',
  'Perdiem', 'Viáticos de Empleados', 'Vuelos de Jueces', 'Vuelos de Empleados',
  'Materiales y Papelería', 'Producción e Imagen', 'Renta de Equipo', 'Hidratación y Médicos'
];

const formatCurrency = (val, currency = 'MXN') =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency, minimumFractionDigits: 2 }).format(Number(val) || 0);

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos de seguridad

export default function App() {
  // ==========================================================================
  // ESTADOS DE AUTENTICACIÓN, SEGURIDAD Y BASE DE DATOS
  // ==========================================================================
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);

  const [navigationStage, setNavigationStage] = useState('HUB');
  const [creationSessionMode, setCreationSessionMode] = useState('IDLE');

  const [activeModule, setActiveModule] = useState('CREACION_EVENTO');
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('mgo_events_cloud_sync_v3');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });
  const [users, setUsers] = useState(() => {
    localStorage.removeItem('mgo_users_cloud_sync_v3');
    return INITIAL_USERS;
  });
  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('mgo_accounts_cloud_sync_v3');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [selectedEventId, setSelectedEventId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Modales de Sobregiro (Al solicitar gasto y al firmar como Presidente)
  const [overdraftRequestModal, setOverdraftRequestModal] = useState(null);
  const [presidentOverdraftSignModal, setPresidentOverdraftSignModal] = useState(null);

  // Modal de Edición de Partida Presupuestal (Exclusivo Presidente)
  const [editRubroModal, setEditRubroModal] = useState(null);
  const [editRubroAmount, setEditRubroAmount] = useState('');

  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null);
  const [passwordModalUser, setPasswordModalUser] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [deleteUserModal, setDeleteUserModal] = useState(null);
  const [cloudStatus, setCloudStatus] = useState('connecting');

  // ==========================================================================
  // SINCRONIZACIÓN BLINDADA Y PURGA AUTOMÁTICA DE USUARIOS DE PRUEBA VIEJOS
  // ==========================================================================
  useEffect(() => {
    if (!auth || !db) {
      setCloudStatus('local');
      return;
    }

    let unsubEvents = null;
    let unsubUsers = null;
    let unsubAccounts = null;

    const cleanupSnapshots = () => {
      if (unsubEvents) { unsubEvents(); unsubEvents = null; }
      if (unsubUsers) { unsubUsers(); unsubUsers = null; }
      if (unsubAccounts) { unsubAccounts(); unsubAccounts = null; }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      cleanupSnapshots();

      if (
        firebaseUser &&
        !firebaseUser.isAnonymous &&
        firebaseUser.email &&
        firebaseUser.email.toLowerCase().endsWith('@mgoevents.com')
      ) {
        const eventsRef = collection(db, 'artifacts', appId, 'public', 'data', 'mgo_events');
        unsubEvents = onSnapshot(eventsRef, (snapshot) => {
          if (!snapshot.empty) {
            const cloudData = snapshot.docs.map((d) => d.data());
            setEvents(cloudData);
            localStorage.setItem('mgo_events_cloud_sync_v3', JSON.stringify(cloudData));
          }
          setCloudStatus('synced');
        }, () => setCloudStatus('local'));

        const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'mgo_users');
        unsubUsers = onSnapshot(usersRef, async (snapshot) => {
          const validCloudUsers = [];

          for (const docSnap of snapshot.docs) {
            const raw = docSnap.data();
            const mail = (raw.email || '').toLowerCase();

            // Si es alguno de los 5 usuarios de prueba anteriores, lo borra de Firestore automáticamente
            if (LEGACY_TEST_EMAILS.includes(mail) || LEGACY_TEST_IDS.includes(docSnap.id)) {
              try {
                await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'mgo_users', docSnap.id));
              } catch (e) {}
              continue;
            }

            const { password, ...safeUser } = raw;
            if (mail === 'gramirez@mgoevents.com') {
              safeUser.rol = 'PRESIDENTE';
              safeUser.nombre = safeUser.nombre || 'Guillermo Ramírez';
              safeUser.cargo = safeUser.cargo || 'Presidente del Consejo';
            }
            validCloudUsers.push(safeUser);
          }

          // Garantiza que gramirez@mgoevents.com siempre esté presente como único usuario base
          if (!validCloudUsers.some((u) => u.email?.toLowerCase() === 'gramirez@mgoevents.com')) {
            const adminUser = INITIAL_USERS[0];
            validCloudUsers.unshift(adminUser);
            try {
              await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'mgo_users', adminUser.id), adminUser);
            } catch (e) {}
          }

          setUsers(validCloudUsers);
          localStorage.setItem('mgo_users_cloud_sync_v4', JSON.stringify(validCloudUsers));
        });

        const accRef = collection(db, 'artifacts', appId, 'public', 'data', 'mgo_accounts');
        unsubAccounts = onSnapshot(accRef, (snapshot) => {
          if (!snapshot.empty) {
            const cloudAcc = snapshot.docs.map((d) => d.data());
            setAccounts(cloudAcc);
            localStorage.setItem('mgo_accounts_cloud_sync_v3', JSON.stringify(cloudAcc));
          }
        });
      } else {
        setCloudStatus('connecting');
      }
    });

    return () => {
      cleanupSnapshots();
      unsubscribeAuth();
    };
  }, []);

  // Cierre automático de sesión por inactividad (15 minutos)
  useEffect(() => {
    if (!loggedInUser) return;
    let timer;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        if (auth) {
          try { await signOut(auth); } catch (e) {}
        }
        setLoggedInUser(null);
        setLoginPassword('');
        setNavigationStage('HUB');
        setLoginError('Por seguridad corporativa, tu sesión se cerró automáticamente tras 15 minutos de inactividad.');
      }, INACTIVITY_TIMEOUT_MS);
    };
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll'];
    activityEvents.forEach((ev) => window.addEventListener(ev, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timer);
      activityEvents.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [loggedInUser]);

  const syncEventToCloud = async (updatedEvent) => {
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === updatedEvent.id);
      const next = exists ? prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)) : [...prev, updatedEvent];
      localStorage.setItem('mgo_events_cloud_sync_v3', JSON.stringify(next));
      return next;
    });

    if (db && auth?.currentUser && !auth.currentUser.isAnonymous) {
      try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'mgo_events', updatedEvent.id), updatedEvent);
      } catch (e) {
        console.error('Error guardando evento en Firebase:', e);
      }
    }
  };

  // Garantiza que JAMÁS se suba un campo password a Firestore
  const syncUserToCloud = async (userObj) => {
    const { password, ...safeUserObj } = userObj;
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === safeUserObj.id);
      const next = exists ? prev.map((u) => (u.id === safeUserObj.id ? safeUserObj : u)) : [...prev, safeUserObj];
      localStorage.setItem('mgo_users_cloud_sync_v4', JSON.stringify(next));
      return next;
    });
    if (db && auth?.currentUser && !auth.currentUser.isAnonymous) {
      try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'mgo_users', safeUserObj.id), safeUserObj);
      } catch (e) {
        console.error('Error guardando usuario en Firebase:', e);
      }
    }
  };

  const syncAccountToCloud = async (accObj) => {
    setAccounts((prev) => {
      const exists = prev.some((a) => a.id === accObj.id);
      const next = exists ? prev.map((a) => (a.id === accObj.id ? accObj : a)) : [...prev, accObj];
      localStorage.setItem('mgo_accounts_cloud_sync_v3', JSON.stringify(next));
      return next;
    });
    if (db && auth?.currentUser && !auth.currentUser.isAnonymous) {
      try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'mgo_accounts', accObj.id), accObj);
      } catch (e) {
        console.error('Error guardando cuenta en Firebase:', e);
      }
    }
  };

  // ==========================================================================
  // PERMISOS Y EVENTOS ASIGNADOS SEGÚN EL ROL DEL USUARIO LOGUEADO
  // ==========================================================================
  const permissions = useMemo(() => {
    if (!loggedInUser) return {};
    const rol = loggedInUser.rol;
    return {
      canCreateEventAndRequestPayment: ['PROJECT_MANAGER', 'DIRECTOR', 'DIRECTOR_GENERAL', 'PRESIDENTE'].includes(rol),
      canFirstSign: ['DIRECTOR', 'DIRECTOR_GENERAL', 'PRESIDENTE'].includes(rol),
      canSecondSign: ['DIRECTOR_GENERAL', 'PRESIDENTE'].includes(rol),
      canDeleteEvent: ['DIRECTOR_GENERAL', 'PRESIDENTE'].includes(rol),
      canManageBankAccounts: ['DIRECTOR_GENERAL', 'PRESIDENTE'].includes(rol),
      canPresidentSign: rol === 'PRESIDENTE',
      canViewExecutiveSummary: rol === 'PRESIDENTE',
      canManageUsers: rol === 'PRESIDENTE',
      canEditBudgetAmounts: rol === 'PRESIDENTE'
    };
  }, [loggedInUser]);

  const accessibleEvents = useMemo(() => {
    if (!loggedInUser) return [];
    if (loggedInUser.rol === 'PROJECT_MANAGER') {
      return events.filter(
        (ev) => ev.responsable?.trim().toLowerCase() === loggedInUser.nombre?.trim().toLowerCase()
      );
    }
    return events;
  }, [events, loggedInUser]);

  const showToast = (type, title, message) => {
    setNotification({ type, title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // ==========================================================================
  // LÓGICA DE LOGIN ENCRIPTADO CON FIREBASE AUTHENTICATION (@mgoevents.com)
  // ==========================================================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSec = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setLoginError(`Sistema bloqueado temporalmente por seguridad tras múltiples intentos fallidos. Intenta de nuevo en ${remainingSec} segundos.`);
      return;
    }

    const cleanEmail = loginEmail.trim().toLowerCase();

    if (!cleanEmail.endsWith('@mgoevents.com')) {
      setLoginError('Acceso denegado: El correo debe pertenecer obligatoriamente al dominio @mgoevents.com');
      return;
    }

    try {
      // 1. Validación encriptada directa contra Firebase Authentication
      await signInWithEmailAndPassword(auth, cleanEmail, loginPassword);

      // 2. Si es gramirez@mgoevents.com, entra siempre como Presidente
      let foundUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

      if (cleanEmail === 'gramirez@mgoevents.com') {
        foundUser = {
          id: foundUser?.id || 'u-pres-gramirez',
          nombre: 'Guillermo Ramírez',
          cargo: 'Presidente del Consejo',
          email: 'gramirez@mgoevents.com',
          rol: 'PRESIDENTE',
          activo: true
        };
        await syncUserToCloud(foundUser);
      } else if (!foundUser) {
        foundUser = {
          id: 'u-' + Date.now(),
          nombre: cleanEmail.split('@')[0].toUpperCase(),
          cargo: 'Ejecutivo MGO',
          email: cleanEmail,
          rol: 'PROJECT_MANAGER',
          activo: true
        };
      }

      if (foundUser.activo === false) {
        await signOut(auth);
        setLoginError('Esta cuenta de usuario se encuentra desactivada.');
        return;
      }

      setFailedAttempts(0);
      setLockoutUntil(null);
      setLoggedInUser(foundUser);
      setNavigationStage('HUB');
    } catch (err) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      if (nextAttempts >= 3) {
        setLockoutUntil(Date.now() + 60 * 1000);
        setFailedAttempts(0);
        setLoginError('Seguridad MGO: Se detectaron 3 intentos fallidos consecutivos. El acceso ha sido bloqueado por 60 segundos.');
      } else {
        setLoginError(`Credenciales inválidas en bóveda encriptada Firebase Auth. Intento ${nextAttempts} de 3.`);
      }
    }
  };

  const handleLogout = async () => {
    if (auth) {
      try { await signOut(auth); } catch (e) {}
    }
    setLoggedInUser(null);
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
    setNavigationStage('HUB');
    setSelectedEventId(null);
  };

  // ==========================================================================
  // ACCIONES DE LA PANTALLA POST-LOGIN
  // ==========================================================================
  const handleStartNewEventFromZero = () => {
    setSelectedEventId(null);
    setCreationSessionMode('NEW_BLANK');
    setNewEvtName('');
    setNewEvtClient('');
    setNewEvtStart('2026-11-15');
    setNewEvtEnd('2026-11-22');
    setNewEvtResp(loggedInUser?.nombre || 'Guillermo Ramírez');
    setNewCityName('');
    setNewHotelName('');
    setNewRubroName('');
    setNewRubroBudget('');
    setNewRubroDesc('');
    setActiveModule('CREACION_EVENTO');
    setNavigationStage('WORKSPACE');
  };

  const handleWorkOnExistingEvent = (eventIdToOpen, targetModule) => {
    const chosenId = eventIdToOpen || accessibleEvents[0]?.id;
    if (!chosenId && targetModule !== 'USUARIOS_ROLES' && targetModule !== 'CUENTAS_BANCARIAS') {
      showToast('error', 'Sin eventos asignados', 'No tienes eventos asignados actualmente. Crea un evento nuevo o solicita asignación.');
      return;
    }
    setSelectedEventId(chosenId);
    setCreationSessionMode('EXISTING_EDIT');

    if (targetModule) {
      setActiveModule(targetModule);
    } else if (loggedInUser?.rol === 'PRESIDENTE') {
      setActiveModule('CONSULTA_PRESIDENTE');
    } else {
      setActiveModule('GASTOS_AUTORIZACION');
    }
    setNavigationStage('WORKSPACE');
  };

  const selectedEvent = useMemo(
    () => accessibleEvents.find((e) => e.id === selectedEventId) || null,
    [accessibleEvents, selectedEventId]
  );

  // ==========================================================================
  // ELIMINACIÓN DE EVENTOS (SOLO DIRECTOR GENERAL Y PRESIDENTE)
  // ==========================================================================
  const handleConfirmDeleteEvent = async () => {
    if (!deleteConfirmModal || !permissions.canDeleteEvent) return;
    if (events.length <= 1) {
      showToast('error', 'Acción no permitida', 'Debe existir al menos un evento activo en el sistema.');
      setDeleteConfirmModal(null);
      return;
    }

    const targetId = deleteConfirmModal.id;
    const remaining = events.filter((e) => e.id !== targetId);
    setEvents(remaining);
    localStorage.setItem('mgo_events_cloud_sync_v3', JSON.stringify(remaining));
    setSelectedEventId(remaining[0]?.id || null);

    if (db && auth?.currentUser && !auth.currentUser.isAnonymous) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'mgo_events', targetId));
      } catch (e) {
        console.error('Error eliminando en Firebase:', e);
      }
    }

    showToast('success', 'Evento Eliminado', `El evento "${deleteConfirmModal.nombre}" fue eliminado por ${loggedInUser.nombre}.`);
    setDeleteConfirmModal(null);
  };

  // ==========================================================================
  // EDICIÓN DE MONTO DE PARTIDA PRESUPUESTAL (EXCLUSIVO PRESIDENTE)
  // ==========================================================================
  const handleSaveEditedRubroAmount = async (e) => {
    e.preventDefault();
    if (!editRubroModal || !permissions.canEditBudgetAmounts || !selectedEvent) {
      showToast('error', 'Acceso Denegado', 'Únicamente el Presidente puede editar los montos de las partidas presupuestales.');
      return;
    }
    const nuevoMonto = parseFloat(editRubroAmount);
    if (isNaN(nuevoMonto) || nuevoMonto < 0) {
      showToast('error', 'Monto inválido', 'Ingresa un monto presupuestal válido.');
      return;
    }

    const updatedRubros = selectedEvent.rubrosPresupuesto.map((r) =>
      r.id === editRubroModal.id ? { ...r, presupuesto: nuevoMonto } : r
    );

    await syncEventToCloud({ ...selectedEvent, rubrosPresupuesto: updatedRubros });
    showToast(
      'success',
      'Partida Actualizada por Presidencia',
      `El presupuesto de "${editRubroModal.categoria}" se actualizó a ${formatCurrency(nuevoMonto)}.`
    );
    setEditRubroModal(null);
    setEditRubroAmount('');
  };

  // ==========================================================================
  // RESTABLECER CONTRASEÑA EN FIREBASE AUTH Y ELIMINAR USUARIOS (PRESIDENTE)
  // ==========================================================================
  const handleSaveNewPassword = async (e) => {
    e.preventDefault();
    if (!passwordModalUser || !permissions.canManageUsers) return;

    try {
      await sendPasswordResetEmail(auth, passwordModalUser.email);
      showToast(
        'success',
        'Enlace Encriptado Enviado',
        `Firebase envió un correo oficial de cambio de contraseña a ${passwordModalUser.email}.`
      );
    } catch (err) {
      showToast(
        'error',
        'Aviso de Firebase Auth',
        'Para cambiarla directamente sin correo, puedes actualizarla en Firebase Console → Authentication → Users.'
      );
    }
    setPasswordModalUser(null);
    setNewPasswordInput('');
  };

  const handleConfirmDeleteUser = async () => {
    if (!deleteUserModal || !permissions.canManageUsers) return;
    if (deleteUserModal.id === loggedInUser.id || deleteUserModal.email.toLowerCase() === 'gramirez@mgoevents.com') {
      showToast('error', 'Acción protegida', 'No puedes eliminar la cuenta principal de Presidencia.');
      setDeleteUserModal(null);
      return;
    }

    const targetId = deleteUserModal.id;
    const remaining = users.filter((u) => u.id !== targetId);
    setUsers(remaining);
    localStorage.setItem('mgo_users_cloud_sync_v4', JSON.stringify(remaining));

    if (db && auth?.currentUser && !auth.currentUser.isAnonymous) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'mgo_users', targetId));
      } catch (e) {
        console.error('Error eliminando usuario en Firebase:', e);
      }
    }

    showToast('success', 'Usuario Eliminado', `El usuario ${deleteUserModal.nombre} (${deleteUserModal.email}) fue eliminado del sistema.`);
    setDeleteUserModal(null);
  };

  // ==========================================================================
  // CÁLCULOS FINANCIEROS EN TIEMPO REAL Y DETECCIÓN DE SOBREGIROS
  // ==========================================================================
  const financialMetrics = useMemo(() => {
    if (!selectedEvent) {
      return {
        presupuestoTotal: 0,
        totalPagado: 0,
        totalEnAutorizacion: 0,
        totalComprometido: 0,
        ahorroSoloPagado: 0,
        disponibleParaComprometer: 0,
        porRubro: [],
        porMetodo: { Transferencia: 0, Tarjeta: 0, Efectivo: 0 }
      };
    }
    const presupuestoTotal = selectedEvent.rubrosPresupuesto.reduce((acc, r) => acc + Number(r.presupuesto || 0), 0);
    const gastosPagados = selectedEvent.gastos.filter((g) => g.firmaPresidente);
    const gastosEnTrámite = selectedEvent.gastos.filter((g) => !g.firmaPresidente);

    const totalPagado = gastosPagados.reduce((acc, g) => acc + Number(g.monto || 0), 0);
    const totalEnAutorizacion = gastosEnTrámite.reduce((acc, g) => acc + Number(g.monto || 0), 0);
    const totalComprometido = totalPagado + totalEnAutorizacion;
    const ahorroSoloPagado = presupuestoTotal - totalPagado;
    const disponibleParaComprometer = presupuestoTotal - totalComprometido;

    const porRubro = selectedEvent.rubrosPresupuesto.map((r) => {
      const pagadoRubro = gastosPagados.filter((g) => g.categoria === r.categoria).reduce((a, b) => a + Number(b.monto), 0);
      const tramiteRubro = gastosEnTrámite.filter((g) => g.categoria === r.categoria).reduce((a, b) => a + Number(b.monto), 0);
      const comprometidoRubro = pagadoRubro + tramiteRubro;
      const disponibleRubro = r.presupuesto - comprometidoRubro;
      const ahorroRubro = r.presupuesto - pagadoRubro;
      const isOverdraft = ahorroRubro < 0 || disponibleRubro < 0;
      return {
        ...r,
        pagadoRubro,
        tramiteRubro,
        comprometidoRubro,
        disponibleRubro,
        ahorroRubro,
        isOverdraft,
        porcentajeEjercido: r.presupuesto > 0 ? (pagadoRubro / r.presupuesto) * 100 : (pagadoRubro > 0 ? 100 : 0)
      };
    });

    const porMetodo = {
      Transferencia: gastosPagados.filter((g) => g.formaPago === 'Transferencia').reduce((a, b) => a + Number(b.monto), 0),
      Tarjeta: gastosPagados.filter((g) => g.formaPago === 'Tarjeta Corporativa').reduce((a, b) => a + Number(b.monto), 0),
      Efectivo: gastosPagados.filter((g) => g.formaPago === 'Efectivo / Reembolso').reduce((a, b) => a + Number(b.monto), 0)
    };

    return {
      presupuestoTotal,
      totalPagado,
      totalEnAutorizacion,
      totalComprometido,
      ahorroSoloPagado,
      disponibleParaComprometer,
      porRubro,
      porMetodo
    };
  }, [selectedEvent]);

  // ==========================================================================
  // ESTADOS MÓDULO 1: CREACIÓN DE EVENTO
  // ==========================================================================
  const [newEvtName, setNewEvtName] = useState('');
  const [newEvtClient, setNewEvtClient] = useState('');
  const [newEvtStart, setNewEvtStart] = useState('2026-11-15');
  const [newEvtEnd, setNewEvtEnd] = useState('2026-11-22');
  const [newEvtResp, setNewEvtResp] = useState('Guillermo Ramírez');

  const [newCityName, setNewCityName] = useState('');
  const [newHotelName, setNewHotelName] = useState('');
  const [selectedCityForHotel, setSelectedCityForHotel] = useState('');

  const [newRubroName, setNewRubroName] = useState('');
  const [newRubroBudget, setNewRubroBudget] = useState('');
  const [newRubroDesc, setNewRubroDesc] = useState('');

  const handleCreateNewEvent = async (e) => {
    e.preventDefault();
    if (!newEvtName.trim() || creationSessionMode === 'CREATED_LOCKED') return;
    const id = 'EVT-' + Date.now().toString().slice(-5);

    const assignedResp = loggedInUser.rol === 'PROJECT_MANAGER' ? loggedInUser.nombre : newEvtResp;

    const nuevo = {
      id,
      nombre: newEvtName.trim(),
      cliente: newEvtClient.trim() || 'Cliente Deportivo',
      fechaInicio: newEvtStart,
      fechaFin: newEvtEnd,
      responsable: assignedResp,
      moneda: 'MXN',
      estatus: 'En Planeación Presupuestal',
      sedes: [],
      rubrosPresupuesto: [],
      gastos: []
    };

    await syncEventToCloud(nuevo);
    setSelectedEventId(id);
    setCreationSessionMode('CREATED_LOCKED');
    showToast('success', 'Evento Creado en Limpio', `Se dio de alta "${nuevo.nombre}" (Responsable: ${assignedResp}). Se han desbloqueado los pasos 1B y 1C.`);
  };

  const handleAddCity = async () => {
    if (!selectedEvent || !newCityName.trim()) return;
    const updated = {
      ...selectedEvent,
      sedes: [...selectedEvent.sedes, { id: 'sede-' + Date.now(), ciudad: newCityName.trim(), hoteles: [] }]
    };
    await syncEventToCloud(updated);
    setSelectedCityForHotel(newCityName.trim());
    setNewCityName('');
    showToast('success', 'Ciudad Agregada', `Se habilitó la sede ${newCityName} en ${selectedEvent.nombre}.`);
  };

  const handleAddHotelToCity = async () => {
    if (!selectedEvent) return;
    const targetCity = selectedCityForHotel || selectedEvent.sedes[0]?.ciudad;
    if (!targetCity || !newHotelName.trim()) {
      showToast('error', 'Agrega primero una ciudad', 'Primero da de alta una ciudad sede arriba para poder asignarle hoteles.');
      return;
    }
    const updated = {
      ...selectedEvent,
      sedes: selectedEvent.sedes.map((s) =>
        s.ciudad === targetCity ? { ...s, hoteles: [...s.hoteles, newHotelName.trim()] } : s
      )
    };
    await syncEventToCloud(updated);
    setNewHotelName('');
    showToast('success', 'Hotel Registrado', `Hotel "${newHotelName}" vinculado a la sede ${targetCity}.`);
  };

  const handleAddRubro = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;
    const monto = parseFloat(newRubroBudget);
    if (!newRubroName.trim() || isNaN(monto) || monto <= 0) return;

    const existing = selectedEvent.rubrosPresupuesto.find(
      (r) => r.categoria.toLowerCase() === newRubroName.trim().toLowerCase()
    );

    if (existing && !permissions.canEditBudgetAmounts) {
      showToast('error', 'Facultad Exclusiva del Presidente', 'Este rubro ya existe. Solo el usuario Presidente puede modificar montos de partidas ya creadas.');
      return;
    }

    let updatedRubros;
    if (existing) {
      updatedRubros = selectedEvent.rubrosPresupuesto.map((r) =>
        r.id === existing.id ? { ...r, presupuesto: r.presupuesto + monto, descripcion: newRubroDesc || r.descripcion } : r
      );
    } else {
      updatedRubros = [
        ...selectedEvent.rubrosPresupuesto,
        { id: 'rub-' + Date.now(), categoria: newRubroName.trim(), presupuesto: monto, descripcion: newRubroDesc || 'Rubro operativo' }
      ];
    }

    await syncEventToCloud({ ...selectedEvent, rubrosPresupuesto: updatedRubros });
    setNewRubroName('');
    setNewRubroBudget('');
    setNewRubroDesc('');
    showToast('success', 'Presupuesto Actualizado', `Rubro "${newRubroName}" agregado con ${formatCurrency(monto)}.`);
  };

  // ==========================================================================
  // ESTADOS MÓDULO 2: GASTOS, VALIDACIÓN DE ASIGNACIÓN PM Y SOBREGIROS
  // ==========================================================================
  const [gastoCiudad, setGastoCiudad] = useState('');
  const [gastoHotel, setGastoHotel] = useState('');
  const [gastoCategoria, setGastoCategoria] = useState('');
  const [gastoProveedor, setGastoProveedor] = useState('');
  const [gastoConcepto, setGastoConcepto] = useState('');
  const [gastoMonto, setGastoMonto] = useState('');
  const [gastoFormaPago, setGastoFormaPago] = useState('Transferencia');
  const [gastoCuenta, setGastoCuenta] = useState('');

  const activeSedeObj = useMemo(() => {
    const city = gastoCiudad || selectedEvent?.sedes[0]?.ciudad;
    return selectedEvent?.sedes.find((s) => s.ciudad === city) || selectedEvent?.sedes[0];
  }, [selectedEvent, gastoCiudad]);

  const canUserRequestPaymentInCurrentEvent = useMemo(() => {
    if (!loggedInUser || !selectedEvent) return false;
    if (loggedInUser.rol === 'PROJECT_MANAGER') {
      return selectedEvent.responsable?.trim().toLowerCase() === loggedInUser.nombre?.trim().toLowerCase();
    }
    return true;
  }, [loggedInUser, selectedEvent]);

  const commitExpenseToDatabase = async (expensePayload, isOverdraftAccepted = false) => {
    const nuevoGasto = {
      id: 'MGO-' + Math.floor(1000 + Math.random() * 9000),
      fecha: new Date().toISOString().split('T')[0],
      sedeCiudad: expensePayload.sedeCiudad,
      hotel: expensePayload.hotel,
      categoria: expensePayload.categoria,
      proveedor: expensePayload.proveedor,
      concepto: expensePayload.concepto,
      descripcion: isOverdraftAccepted
        ? `Solicitado por ${loggedInUser.nombre} (SOBREGIRO ACEPTADO POR SOLICITANTE)`
        : `Solicitado por ${loggedInUser.nombre}`,
      monto: expensePayload.monto,
      formaPago: expensePayload.formaPago,
      cuenta: expensePayload.cuenta,
      pagadoPor: loggedInUser.nombre,
      solicitadoPor: loggedInUser.nombre,
      comprobante: 'Factura',
      esSobregiro: isOverdraftAccepted,
      excesoSobregiro: expensePayload.exceso || 0,
      authDirOp: false,
      authDirGen: false,
      firmaPresidente: false,
      selloDigital: null,
      estatus: isOverdraftAccepted ? 'En Trámite (CON SOBREGIRO)' : 'Pendiente 2 Autorizaciones'
    };

    await syncEventToCloud({
      ...selectedEvent,
      gastos: [nuevoGasto, ...selectedEvent.gastos]
    });

    setGastoProveedor('');
    setGastoConcepto('');
    setGastoMonto('');
    setOverdraftRequestModal(null);

    if (isOverdraftAccepted) {
      showToast('error', 'Solicitud con Sobregiro Registrada', 'El pago fue ingresado bajo advertencia de sobregiro y requerirá confirmación especial del Presidente.');
    } else {
      showToast('success', 'Solicitud Registrada', 'El pago se encuentra dentro del presupuesto y espera 1ra y 2da firma.');
    }
  };

  const handleRegisterExpense = async (e) => {
    e.preventDefault();
    if (!selectedEvent) {
      showToast('error', 'Sin evento activo', 'Selecciona o crea un evento primero.');
      return;
    }

    if (!canUserRequestPaymentInCurrentEvent) {
      showToast(
        'error',
        'Evento No Asignado a tu Usuario',
        `Como Project Manager (${loggedInUser.nombre}), solo puedes solicitar pagos en eventos donde estás asignado como Responsable.`
      );
      return;
    }

    if (selectedEvent.rubrosPresupuesto.length === 0) {
      showToast('error', 'Sin presupuesto cargado', 'Primero agrega rubros presupuestales en el paso 1C.');
      return;
    }

    const montoNum = parseFloat(gastoMonto);
    const cat = gastoCategoria || selectedEvent.rubrosPresupuesto[0]?.categoria;
    if (!gastoProveedor.trim() || !gastoConcepto.trim() || isNaN(montoNum) || montoNum <= 0) {
      showToast('error', 'Datos incompletos', 'Ingresa proveedor, concepto y un monto válido.');
      return;
    }

    const rubroInfo = financialMetrics.porRubro.find((r) => r.categoria === cat);
    const disponibleEnRubro = rubroInfo ? rubroInfo.disponibleRubro : 0;
    const disponibleGlobal = financialMetrics.disponibleParaComprometer;
    const cuentaElegida = gastoCuenta || accounts[0]?.nombre || 'MGO Digital';

    const payload = {
      sedeCiudad: activeSedeObj?.ciudad || 'Sede General',
      hotel: gastoHotel || activeSedeObj?.hoteles[0] || 'Sede Oficial',
      categoria: cat,
      proveedor: gastoProveedor.trim(),
      concepto: gastoConcepto.trim(),
      monto: montoNum,
      formaPago: gastoFormaPago,
      cuenta: cuentaElegida,
      disponibleRubro: disponibleEnRubro,
      presupuestoRubro: rubroInfo?.presupuesto || 0,
      exceso: Math.max(0, montoNum - disponibleEnRubro)
    };

    if (montoNum > disponibleEnRubro || montoNum > disponibleGlobal) {
      setOverdraftRequestModal(payload);
      return;
    }

    await commitExpenseToDatabase(payload, false);
  };

  const executePresidentSignature = async (gastoId, confirmedOverdraft = false) => {
    if (!selectedEvent) return;
    const sello = 'MGO-SIG-' + Math.floor(100000 + Math.random() * 900000) + (confirmedOverdraft ? '-PRES-OVD' : '-PRES');
    const updatedGastos = selectedEvent.gastos.map((g) => {
      if (g.id !== gastoId) return g;
      return {
        ...g,
        firmaPresidente: true,
        selloDigital: sello,
        esSobregiro: g.esSobregiro || confirmedOverdraft,
        estatus: confirmedOverdraft ? 'Pagado (Sobregiro Autorizado)' : 'Pagado'
      };
    });

    await syncEventToCloud({ ...selectedEvent, gastos: updatedGastos });
    setPresidentOverdraftSignModal(null);
    showToast(
      'success',
      confirmedOverdraft ? 'Sobregiro Autorizado y Firmado' : 'Firma Digital Estampada',
      `Pago liberado por Presidencia con sello ${sello}.`
    );
  };

  const handleToggleAuth = async (gastoId, type) => {
    if (!selectedEvent) return;
    const targetGasto = selectedEvent.gastos.find((g) => g.id === gastoId);
    if (!targetGasto) return;

    if (type === 'PRESIDENTE') {
      if (!permissions.canPresidentSign) {
        showToast('error', 'Exclusivo del Presidente', 'Únicamente el Presidente puede estampar la Firma Digital liberadora.');
        return;
      }
      if (!targetGasto.authDirOp || !targetGasto.authDirGen) {
        showToast('error', 'Firma Bloqueada por Regla MGO', 'El Presidente no puede firmar pagos sin las 2 autorizaciones previas (Director y Director General).');
        return;
      }

      const rubroObj = financialMetrics.porRubro.find((r) => r.categoria === targetGasto.categoria);
      const pagadoActualRubro = rubroObj ? rubroObj.pagadoRubro : 0;
      const presupuestoRubro = rubroObj ? rubroObj.presupuesto : 0;
      const nuevoTotalPagadoRubro = pagadoActualRubro + Number(targetGasto.monto || 0);
      const excedeAlFirmar = targetGasto.esSobregiro || nuevoTotalPagadoRubro > presupuestoRubro;

      if (excedeAlFirmar) {
        setPresidentOverdraftSignModal({
          gasto: targetGasto,
          presupuestoRubro,
          pagadoActualRubro,
          nuevoTotalPagadoRubro,
          excesoTotal: Math.max(0, nuevoTotalPagadoRubro - presupuestoRubro)
        });
        return;
      }

      await executePresidentSignature(gastoId, false);
      return;
    }

    const updatedGastos = selectedEvent.gastos.map((g) => {
      if (g.id !== gastoId) return g;

      if (type === 'FIRST_SIGN') {
        if (!permissions.canFirstSign) {
          showToast('error', 'Permiso Denegado', 'Tu rol de Project Manager no cuenta con facultades para dar la 1ra Firma.');
          return g;
        }
        const nextVal = !g.authDirOp;
        return {
          ...g,
          authDirOp: nextVal,
          estatus: nextVal && g.authDirGen ? 'Listo para Firma Presidente' : 'Pendiente Autorización'
        };
      }

      if (type === 'SECOND_SIGN') {
        if (!permissions.canSecondSign) {
          showToast('error', 'Permiso Denegado', 'Solo el Director General o el Presidente pueden otorgar la 2da Firma.');
          return g;
        }
        const nextVal = !g.authDirGen;
        return {
          ...g,
          authDirGen: nextVal,
          estatus: g.authDirOp && nextVal ? 'Listo para Firma Presidente' : 'Pendiente Autorización'
        };
      }
      return g;
    });

    await syncEventToCloud({ ...selectedEvent, gastos: updatedGastos });
  };

  // ==========================================================================
  // ESTADOS MÓDULO 4 y 5: USUARIOS (CREACIÓN EN FIREBASE AUTH) Y CUENTAS
  // ==========================================================================
  const [uNombre, setUNombre] = useState('');
  const [uCargo, setUCargo] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uPassword, setUPassword] = useState('');
  const [uRol, setURol] = useState('PROJECT_MANAGER');

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!permissions.canManageUsers) {
      showToast('error', 'Acceso Restringido', 'Solo el Presidente puede dar de alta usuarios.');
      return;
    }

    const cleanMail = uEmail.trim().toLowerCase();
    if (!cleanMail.endsWith('@mgoevents.com')) {
      showToast('error', 'Correo Inválido', 'Todo usuario debe tener obligatoriamente un correo que termine en @mgoevents.com');
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === cleanMail)) {
      showToast('error', 'Usuario Duplicado', 'Ya existe un usuario registrado con ese correo @mgoevents.com');
      return;
    }

    if (!uPassword || uPassword.length < 6) {
      showToast('error', 'Política de Seguridad', 'Asigna una contraseña segura de al menos 6 caracteres.');
      return;
    }

    try {
      // 1. Registra la cuenta encriptada en Firebase Authentication sin cerrar la sesión del Presidente
      const secondaryApp = initializeApp(firebaseConfig, 'SecondaryAuthApp-' + Date.now());
      const secondaryAuth = getAuth(secondaryApp);
      await createUserWithEmailAndPassword(secondaryAuth, cleanMail, uPassword);
      await signOut(secondaryAuth);
      await deleteApp(secondaryApp);
    } catch (authErr) {
      if (authErr?.code !== 'auth/email-already-in-use') {
        showToast('error', 'Error en Bóveda Firebase Auth', authErr.message || 'No se pudo registrar en Firebase Auth.');
        return;
      }
    }

    // 2. Guarda únicamente el perfil y rol en Firestore (SIN contraseña)
    const nuevo = {
      id: 'u-' + Date.now(),
      nombre: uNombre.trim(),
      cargo: uCargo.trim() || ROLE_LABELS[uRol],
      email: cleanMail,
      rol: uRol,
      activo: true
    };

    await syncUserToCloud(nuevo);
    setUNombre('');
    setUCargo('');
    setUEmail('');
    setUPassword('');
    showToast('success', 'Usuario Encriptado Creado', `${nuevo.nombre} (${nuevo.email}) registrado en Firebase Auth y MGO ERP.`);
  };

  const [accNombre, setAccNombre] = useState('');
  const [accBancoEmisor, setAccBancoEmisor] = useState('');
  const [accTipoCuenta, setAccTipoCuenta] = useState('Cheques');
  const [accPais, setAccPais] = useState('México');

  const handleAddBankAccount = async (e) => {
    e.preventDefault();
    if (!permissions.canManageBankAccounts) return;
    if (!accBancoEmisor.trim()) return;

    const etiquetaNombre = accNombre.trim()
      ? `${accNombre.trim()} (${accBancoEmisor.trim()})`
      : `${accBancoEmisor.trim()} - ${accTipoCuenta} (${accPais})`;

    const nuevaCuenta = {
      id: 'acc-' + Date.now(),
      nombre: etiquetaNombre,
      bancoEmisor: accBancoEmisor.trim(),
      tipoCuenta: accTipoCuenta,
      pais: accPais
    };

    await syncAccountToCloud(nuevaCuenta);
    setAccNombre('');
    setAccBancoEmisor('');
    showToast('success', 'Cuenta / Tarjeta Dada de Alta', `Se registró "${nuevaCuenta.nombre}" (${nuevaCuenta.tipoCuenta} • ${nuevaCuenta.pais}).`);
  };

  const handleDeleteBankAccount = async (acc) => {
    if (!permissions.canManageBankAccounts) return;
    if (accounts.length <= 1) {
      showToast('error', 'Acción no permitida', 'Debe existir al menos una cuenta o tarjeta activa en el sistema.');
      return;
    }
    const remaining = accounts.filter((a) => a.id !== acc.id);
    setAccounts(remaining);
    localStorage.setItem('mgo_accounts_cloud_sync_v3', JSON.stringify(remaining));

    if (db && auth?.currentUser && !auth.currentUser.isAnonymous) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'mgo_accounts', acc.id));
      } catch (e) {
        console.error('Error eliminando cuenta en Firebase:', e);
      }
    }
    showToast('success', 'Cuenta Eliminada', `Se eliminó "${acc.nombre}" del catálogo.`);
  };

  const handleExportExcel = () => {
    if (!selectedEvent || !financialMetrics) return;
    const rows = [
      ['ACTA DE CIERRE FINANCIERO Y CUADRE PRESUPUESTAL - MGO EVENTS'],
      ['Evento:', selectedEvent.nombre, 'Cliente:', selectedEvent.cliente],
      ['Fecha Inicio:', selectedEvent.fechaInicio, 'Fecha Termino:', selectedEvent.fechaFin],
      ['Presupuesto Total:', financialMetrics.presupuestoTotal, 'Total Pagado (Firmado):', financialMetrics.totalPagado],
      ['Ahorro / Desviacion vs Pagado:', financialMetrics.ahorroSoloPagado],
      [],
      ['ID', 'Fecha', 'Ciudad Sede', 'Hotel', 'Rubro / Categoria', 'Proveedor', 'Concepto', 'Monto MXN', 'Sobregiro', 'Forma de Pago', 'Cuenta / Tarjeta', '1ra Firma Director', '2da Firma Dir General', 'Firma Digital Presidente', 'Sello Digital']
    ];
    selectedEvent.gastos.forEach((g) => {
      rows.push([
        g.id, g.fecha, g.sedeCiudad, g.hotel, g.categoria, g.proveedor, g.concepto,
        g.monto, g.esSobregiro ? 'SI (SOBREGIRO)' : 'NO', g.formaPago, g.cuenta,
        g.authDirOp ? 'AUTORIZADO' : 'PENDIENTE',
        g.authDirGen ? 'AUTORIZADO' : 'PENDIENTE',
        g.firmaPresidente ? 'FIRMADO Y PAGADO' : 'SIN FIRMA',
        g.selloDigital || 'N/A'
      ]);
    });
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Cierre_${selectedEvent.nombre.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================================================
  // VISTA 1: LOGIN CORPORATIVO BLINDADO (@mgoevents.com)
  // ==========================================================================
  if (!loggedInUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between relative overflow-hidden font-sans">
        <div className="h-2 w-full bg-gradient-to-r from-[#0D4F8B] via-[#118A96] via-[#9B1B60] via-[#EE2743] via-[#F37338] to-[#F5D34B]" />

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-8 pb-6 text-center border-b border-slate-100 bg-slate-50/60 flex flex-col items-center">
              <MGOLogo size="lg" />
              <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#0D4F8B]/10 text-[#0D4F8B]">
                <Lock className="w-3.5 h-3.5" /> Acceso Corporativo Encriptado
              </span>
              <p className="text-xs text-slate-500 mt-2">
                Ingresa con tu cuenta oficial <strong>@mgoevents.com</strong>. Sesión protegida con bloqueo anti-intrusión y cierre automático.
              </p>
            </div>

            <form onSubmit={handleLogin} className="p-8 pt-6 space-y-5">
              {loginError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Correo Electrónico Corporativo *
                </label>
                <input
                  type="email"
                  placeholder="usuario@mgoevents.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full mt-1.5 px-4 py-3 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#0D4F8B]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Contraseña *
                </label>
                <div className="relative mt-1.5">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#0D4F8B]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#0D4F8B] to-[#118A96] hover:opacity-95 text-white font-black py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm transition"
              >
                <LogIn className="w-4 h-4" />
                Ingresar al Sistema MGO
              </button>
            </form>
          </div>
        </div>

        <footer className="text-center py-4 text-xs text-slate-500">
          MGO Events — High Performance Sports Logistics • Seguridad Financiera Activa
        </footer>
      </div>
    );
  }

  // ==========================================================================
  // VISTA 2: PANTALLA ESTÉTICA POST-LOGIN CON LAS 2 GRANDES OPCIONES
  // ==========================================================================
  if (navigationStage === 'HUB') {
    const roleActionsList = {
      PROJECT_MANAGER: [
        { label: 'Solicitar Gasto / Pago en mis Eventos Asignados', module: 'GASTOS_AUTORIZACION', icon: CreditCard, color: '#9B1B60' },
        { label: 'Agregar Sedes, Hoteles o Rubros a mis Eventos', module: 'CREACION_EVENTO', icon: Layers, color: '#118A96' }
      ],
      DIRECTOR: [
        { label: 'Autorizar Pagos (1ra Firma Director) y Solicitar Gastos', module: 'GASTOS_AUTORIZACION', icon: ShieldCheck, color: '#9B1B60' },
        { label: 'Configurar Sedes, Hoteles y Rubros del Evento', module: 'CREACION_EVENTO', icon: Layers, color: '#118A96' }
      ],
      DIRECTOR_GENERAL: [
        { label: 'Autorizar Pagos (2da Firma Dir. General) y Gastos', module: 'GASTOS_AUTORIZACION', icon: ShieldCheck, color: '#9B1B60' },
        { label: 'Dar de Alta Cuenta de Banco o Tarjeta (México / USA)', module: 'CUENTAS_BANCARIAS', icon: Landmark, color: '#0D4F8B' },
        { label: 'Editar Sedes / Rubros o Eliminar Eventos Creados', module: 'CREACION_EVENTO', icon: Layers, color: '#118A96' }
      ],
      PRESIDENTE: [
        { label: 'Ver Reporte Ejecutivo, Sobregiros y Editar Partidas', module: 'CONSULTA_PRESIDENTE', icon: BarChart3, color: '#0D4F8B' },
        { label: 'Firmar Pagos (Firma Digital) y Autorizar Sobregiros', module: 'GASTOS_AUTORIZACION', icon: KeyRound, color: '#9B1B60' },
        { label: 'Dar de Alta Cuenta de Banco o Tarjeta (México / USA)', module: 'CUENTAS_BANCARIAS', icon: Landmark, color: '#118A96' },
        { label: 'Crear / Eliminar Usuarios y Cambiar Contraseñas', module: 'USUARIOS_ROLES', icon: Users, color: '#F37338' }
      ]
    }[loggedInUser.rol] || [];

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between font-sans">
        <div className="h-2 w-full bg-gradient-to-r from-[#0D4F8B] via-[#118A96] via-[#9B1B60] via-[#EE2743] via-[#F37338] to-[#F5D34B]" />

        <div className="max-w-6xl w-full mx-auto px-6 pt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="bg-white px-4 py-2.5 rounded-2xl shadow-md">
            <MGOLogo />
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 border border-white/15 px-4 py-2 rounded-xl text-xs flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F5D34B]" />
              <div>
                <div className="font-black text-white">{loggedInUser.nombre}</div>
                <div className="text-[11px] text-slate-300">{loggedInUser.email}</div>
              </div>
              <span className="ml-2 bg-[#F5D34B] text-slate-950 font-black px-2.5 py-1 rounded-lg text-[10px] uppercase">
                {ROLE_LABELS[loggedInUser.rol]}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-lg"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>

        <div className="max-w-6xl w-full mx-auto px-6 py-10 flex-1 flex flex-col justify-center">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#F5D34B] bg-white/10 px-3.5 py-1 rounded-full">
              Panel de Control Operativo MGO Events
            </span>
            <h1 className="text-3xl md:text-4xl font-black mt-3 tracking-tight">
              ¿Qué deseas realizar hoy, {loggedInUser.nombre}?
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Selecciona una de las dos modalidades de trabajo. Tus permisos activos corresponden al perfil de <strong>{ROLE_LABELS[loggedInUser.rol]}</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-[#0D4F8B]/40 border-2 border-[#118A96]/60 hover:border-[#F5D34B] rounded-3xl p-8 flex flex-col justify-between shadow-2xl transition-all group">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#118A96] to-[#0D4F8B] flex items-center justify-center shadow-lg">
                    <PlusCircle className="w-9 h-9 text-white" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#118A96]/20 text-teal-300 border border-teal-400/30">
                    Opción 1 • Lienzo en Blanco
                  </span>
                </div>

                <h2 className="text-2xl font-black mt-6 text-white group-hover:text-[#F5D34B] transition">
                  1. Crear Evento Nuevo
                </h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Inicia un evento deportivo completamente <strong>desde cero</strong>, sin ningún evento previo seleccionado y sin ningún rubro presupuestal preestablecido.
                </p>

                <div className="mt-6 space-y-2.5 bg-black/30 p-4 rounded-2xl border border-white/10 text-xs text-slate-300">
                  <div className="font-bold text-[#F5D34B] uppercase tracking-wider text-[11px]">
                    Flujo de Alta Controlado en 3 Pasos:
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span><strong>Paso 1A Activo:</strong> Captura los datos generales y crea el evento (el botón se bloqueará tras crearlo para evitar duplicados).</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>Pasos 1B y 1C Protegidos:</strong> Sedes, hoteles y rubros permanecen desactivados hasta que des de alta el evento en el paso 1A.</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartNewEventFromZero}
                className="mt-8 w-full bg-gradient-to-r from-[#118A96] to-[#0D4F8B] hover:from-[#149ca9] hover:to-[#0f5ca3] text-white font-black py-4 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-3 text-base transition"
              >
                <span>Comenzar Evento Nuevo desde Cero</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-[#9B1B60]/30 border-2 border-white/15 hover:border-[#F37338] rounded-3xl p-8 flex flex-col justify-between shadow-2xl transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9B1B60] via-[#EE2743] to-[#F37338] flex items-center justify-center shadow-lg">
                    <FolderOpen className="w-9 h-9 text-white" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#F37338]/20 text-orange-300 border border-orange-400/30">
                    Opción 2 • Perfil {ROLE_LABELS[loggedInUser.rol]}
                  </span>
                </div>

                <h2 className="text-2xl font-black mt-6 text-white">
                  2. Trabajar en un Evento Existente
                </h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  {loggedInUser.rol === 'PROJECT_MANAGER'
                    ? 'Selecciona uno de los eventos asignados a tu nombre para solicitar pagos:'
                    : 'Selecciona un evento en curso y accede a las funciones de tu nivel de autorización:'}
                </p>

                <div className="mt-5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#F5D34B]">
                    {loggedInUser.rol === 'PROJECT_MANAGER'
                      ? `Eventos Asignados a ${loggedInUser.nombre}:`
                      : 'Seleccionar Evento Activo en Base de Datos:'}
                  </label>
                  {accessibleEvents.length === 0 ? (
                    <div className="mt-2 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200">
                      No tienes eventos asignados como responsable en este momento.
                    </div>
                  ) : (
                    <select
                      value={selectedEventId || accessibleEvents[0]?.id || ''}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-950 border border-white/20 text-white font-bold text-sm focus:outline-none focus:border-[#F5D34B]"
                    >
                      {accessibleEvents.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.nombre} — (Resp: {ev.responsable})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="mt-5 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Acciones disponibles para {ROLE_LABELS[loggedInUser.rol]}:
                  </div>
                  {roleActionsList.map((act, idx) => {
                    const Icon = act.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleWorkOnExistingEvent(selectedEventId || accessibleEvents[0]?.id, act.module)}
                        className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-between text-left transition group"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: act.color }}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#F5D34B] transition">
                            {act.label}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                disabled={accessibleEvents.length === 0}
                onClick={() => handleWorkOnExistingEvent(selectedEventId || accessibleEvents[0]?.id)}
                className="mt-6 w-full bg-gradient-to-r from-[#9B1B60] via-[#EE2743] to-[#F37338] hover:opacity-95 disabled:opacity-40 text-white font-black py-4 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-3 text-base transition"
              >
                <span>Abrir Evento Seleccionado</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <footer className="text-center py-4 text-xs text-slate-500">
          MGO Events — High Performance Sports Logistics • Control Presupuestal y Firma Digital
        </footer>
      </div>
    );
  }

  const availableTabs = [
    {
      id: 'CREACION_EVENTO',
      num: '1',
      title: 'Creación de Evento',
      sub: 'Sedes, Hoteles y Rubros de Presupuesto',
      icon: Layers,
      color: '#118A96',
      visible: permissions.canCreateEventAndRequestPayment
    },
    {
      id: 'GASTOS_AUTORIZACION',
      num: '2',
      title: 'Gastos y Autorizaciones',
      sub: 'Solicitudes vs Presupuesto y Firmas por Nivel',
      icon: CreditCard,
      color: '#9B1B60',
      visible: permissions.canCreateEventAndRequestPayment
    },
    {
      id: 'CONSULTA_PRESIDENTE',
      num: '3',
      title: 'Consulta Ejecutiva (Presidente)',
      sub: 'Presupuesto vs Gasto Real y Edición de Partidas',
      icon: BarChart3,
      color: '#0D4F8B',
      visible: permissions.canViewExecutiveSummary
    },
    {
      id: 'USUARIOS_ROLES',
      num: '4',
      title: 'Administración de Usuarios',
      sub: 'Exclusivo Presidente (@mgoevents.com)',
      icon: Users,
      color: '#F37338',
      visible: permissions.canManageUsers
    },
    {
      id: 'CUENTAS_BANCARIAS',
      num: '5',
      title: 'Cuentas y Tarjetas',
      sub: 'Dir. General y Presidente (México / USA)',
      icon: Landmark,
      color: '#0D4F8B',
      visible: permissions.canManageBankAccounts
    }
  ].filter((t) => t.visible);

  const isStep1BAnd1CLocked = !selectedEvent || creationSessionMode === 'NEW_BLANK';
  const isStep1AButtonLocked = creationSessionMode === 'CREATED_LOCKED';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 max-w-md p-4 rounded-xl shadow-2xl border flex items-start gap-3 ${
          notification.type === 'error' ? 'bg-red-950 text-white border-red-700' : 'bg-slate-900 text-white border-teal-500'
        }`}>
          {notification.type === 'error' ? <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" /> : <CheckCircle2 className="w-6 h-6 text-teal-400 shrink-0" />}
          <div>
            <h4 className="font-bold text-sm">{notification.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5">{notification.message}</p>
          </div>
        </div>
      )}

      {/* MODAL 1: ADVERTENCIA Y ACEPTACIÓN DE SOBREGIRO AL SOLICITAR PAGO */}
      {overdraftRequestModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border-2 border-red-600">
            <div className="bg-gradient-to-r from-red-700 via-[#EE2743] to-[#F37338] p-5 text-white flex items-center gap-3">
              <ShieldAlert className="w-10 h-10 shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded">
                  Advertencia de Sobregiro Presupuestal
                </span>
                <h3 className="text-xl font-black mt-1">¡EL PRESUPUESTO SE VA A SOBREGIRAR!</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-700">
                La solicitud de pago para <strong>{overdraftRequestModal.proveedor}</strong> supera el saldo disponible en la partida <strong>{overdraftRequestModal.categoria}</strong>. ¿Deseas aceptar la responsabilidad del sobregiro e ingresar la solicitud?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Presupuesto Autorizado ({overdraftRequestModal.categoria}):</span>
                  <span className="font-bold">{formatCurrency(overdraftRequestModal.presupuestoRubro)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Saldo Disponible Actual:</span>
                  <span className="font-bold text-emerald-700">{formatCurrency(overdraftRequestModal.disponibleRubro)}</span>
                </div>
                <div className="flex justify-between border-t border-red-200 pt-2">
                  <span className="text-red-700 font-bold">Monto que estás solicitando:</span>
                  <span className="font-black text-red-700">{formatCurrency(overdraftRequestModal.monto)}</span>
                </div>
                <div className="flex justify-between text-xs bg-red-600 text-white px-3 py-2 rounded-lg font-black">
                  <span>Monto del Sobregiro a Generar:</span>
                  <span>- {formatCurrency(overdraftRequestModal.exceso)}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setOverdraftRequestModal(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Cancelar y Corregir Monto
                </button>
                <button
                  type="button"
                  onClick={() => commitExpenseToDatabase(overdraftRequestModal, true)}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white shadow-lg"
                >
                  Aceptar Sobregiro y Enviar Solicitud
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRMACIÓN DEL PRESIDENTE PARA FIRMAR UN SOBREGIRO */}
      {presidentOverdraftSignModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border-2 border-red-600">
            <div className="bg-gradient-to-r from-slate-900 via-red-800 to-red-600 p-5 text-white flex items-center gap-3">
              <KeyRound className="w-10 h-10 text-[#F5D34B] shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded text-[#F5D34B]">
                  Confirmación Ejecutiva de Presidencia
                </span>
                <h3 className="text-lg font-black mt-1">AUTORIZACIÓN DE SOBREGIRO PRESUPUESTARIO</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-700">
                Presidente: El pago <strong>{presidentOverdraftSignModal.gasto.id}</strong> a favor de <strong>{presidentOverdraftSignModal.gasto.proveedor}</strong> excede el presupuesto de la partida <strong>{presidentOverdraftSignModal.gasto.categoria}</strong>. Al firmarlo, el rubro quedará en números rojos en el Reporte Ejecutivo.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Presupuesto de la Partida:</span>
                  <span className="font-bold">{formatCurrency(presidentOverdraftSignModal.presupuestoRubro)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Monto de este Pago por Firmar:</span>
                  <span className="font-black text-red-700">{formatCurrency(presidentOverdraftSignModal.gasto.monto)}</span>
                </div>
                <div className="flex justify-between border-t border-red-200 pt-2">
                  <span className="text-slate-700 font-bold">Nuevo Total Ejercido en Partida:</span>
                  <span className="font-black text-red-700">{formatCurrency(presidentOverdraftSignModal.nuevoTotalPagadoRubro)}</span>
                </div>
                <div className="flex justify-between text-xs bg-red-600 text-white px-3 py-2 rounded-lg font-black">
                  <span>Sobregiro Total Autorizado:</span>
                  <span>- {formatCurrency(presidentOverdraftSignModal.excesoTotal)}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPresidentOverdraftSignModal(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Cancelar Firma
                </button>
                <button
                  type="button"
                  onClick={() => executePresidentSignature(presidentOverdraftSignModal.gasto.id, true)}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white shadow-lg flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Aceptar Sobregiro y Estampar Firma Digital
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDICIÓN DE PARTIDA PRESUPUESTAL (EXCLUSIVO PRESIDENTE) */}
      {editRubroModal && permissions.canEditBudgetAmounts && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#0D4F8B]">
              <Edit3 className="w-7 h-7 shrink-0" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#118A96]">Facultad Exclusiva de Presidencia</span>
                <h3 className="text-lg font-black text-slate-900">Editar Presupuesto de Partida</h3>
                <p className="text-xs text-slate-500">Rubro: <strong>{editRubroModal.categoria}</strong></p>
              </div>
            </div>
            <form onSubmit={handleSaveEditedRubroAmount} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase">Nuevo Monto Autorizado (MXN) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={editRubroAmount}
                  onChange={(e) => setEditRubroAmount(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 border border-slate-300 rounded-xl text-base font-black text-[#0D4F8B] focus:outline-none focus:border-[#0D4F8B]"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditRubroModal(null);
                    setEditRubroAmount('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-black bg-[#0D4F8B] hover:bg-[#093b69] text-white"
                >
                  Guardar Nuevo Presupuesto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {passwordModalUser && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#0D4F8B]">
              <KeyRound className="w-7 h-7 shrink-0" />
              <div>
                <h3 className="text-lg font-black text-slate-900">Restablecer Contraseña Encriptada</h3>
                <p className="text-xs text-slate-500">{passwordModalUser.nombre} ({passwordModalUser.email})</p>
              </div>
            </div>
            <form onSubmit={handleSaveNewPassword} className="space-y-4">
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                Por seguridad bancaria, las contraseñas ya no se almacenan en la base de datos. Al confirmar, <strong>Firebase Authentication</strong> enviará un enlace oficial de cambio de contraseña al correo <strong>{passwordModalUser.email}</strong>.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordModalUser(null);
                    setNewPasswordInput('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-black bg-[#0D4F8B] hover:bg-[#093b69] text-white"
                >
                  Enviar Correo de Restablecimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteUserModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-red-300 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <Trash2 className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="text-lg font-black text-slate-900">¿Eliminar Usuario del Sistema?</h3>
                <p className="text-xs text-slate-500">Esta acción revocará su perfil en el ERP de forma inmediata</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Estás por eliminar a <strong>{deleteUserModal.nombre}</strong> (<code>{deleteUserModal.email}</code>) con rol <strong>{ROLE_LABELS[deleteUserModal.rol]}</strong>.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteUserModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteUser}
                className="px-4 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white"
              >
                Sí, Eliminar Usuario
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-red-300 p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <Trash2 className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="text-lg font-black text-slate-900">¿Eliminar Evento del Sistema?</h3>
                <p className="text-xs text-slate-500">Facultad exclusiva de Director General y Presidente</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Estás a punto de eliminar el evento <strong>"{deleteConfirmModal.nombre}"</strong> junto con su presupuesto y registros asociados.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteEvent}
                className="px-4 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white"
              >
                Sí, Eliminar Evento
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#0D4F8B] text-white text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNavigationStage('HUB')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-black bg-[#F5D34B] text-slate-950 hover:bg-amber-300 transition shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Menú Inicial (2 Opciones)
            </button>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
              <Cloud className="w-3.5 h-3.5" />
              {cloudStatus === 'synced' ? 'Firebase Cloud Encriptado' : 'Sincronización Activa'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 px-3 py-1 rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F5D34B]" />
              <span className="font-bold">{loggedInUser.nombre}</span>
              <span className="text-white/70">({loggedInUser.email})</span>
              <span className="bg-[#F5D34B] text-slate-950 font-black px-2 py-0.5 rounded text-[10px] uppercase">
                {ROLE_LABELS[loggedInUser.rol]}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0D4F8B] via-[#118A96] via-[#9B1B60] via-[#EE2743] via-[#F37338] to-[#F5D34B]" />
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <MGOLogo />

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#118A96]" />
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-500">
                  {loggedInUser.rol === 'PROJECT_MANAGER' ? 'Mis Eventos Asignados' : 'Evento en Trabajo'}
                </div>
                <select
                  value={selectedEvent?.id || ''}
                  onChange={(e) => {
                    if (e.target.value === '__NEW__') {
                      handleStartNewEventFromZero();
                    } else {
                      setSelectedEventId(e.target.value);
                      setCreationSessionMode('EXISTING_EDIT');
                    }
                  }}
                  className="bg-transparent font-black text-sm text-[#0D4F8B] focus:outline-none cursor-pointer pr-2"
                >
                  {!selectedEvent && (
                    <option value="">-- Creando Evento Nuevo desde Cero --</option>
                  )}
                  {accessibleEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.nombre} (Resp: {ev.responsable})
                    </option>
                  ))}
                  <option value="__NEW__">+ Iniciar Otro Evento Nuevo desde Cero...</option>
                </select>
              </div>
            </div>

            {selectedEvent && permissions.canDeleteEvent && (
              <button
                onClick={() => setDeleteConfirmModal(selectedEvent)}
                className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1.5 transition"
                title="Facultad de Director General y Presidente"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Evento
              </button>
            )}

            {selectedEvent && (
              <button
                onClick={handleExportExcel}
                className="bg-[#118A96] hover:bg-[#0e747e] text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition"
              >
                <Download className="w-4 h-4" />
                Descargar Cierre (Excel)
              </button>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto border-t border-slate-100">
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeModule === tab.id;
            const disabledTab = !selectedEvent && (tab.id === 'GASTOS_AUTORIZACION' || tab.id === 'CONSULTA_PRESIDENTE');
            return (
              <button
                key={tab.id}
                disabled={disabledTab}
                onClick={() => setActiveModule(tab.id)}
                className={`flex items-center gap-3 px-5 py-3.5 border-b-4 transition-all shrink-0 text-left ${
                  active
                    ? 'border-[#0D4F8B] bg-slate-50/90'
                    : disabledTab
                    ? 'border-transparent opacity-40 cursor-not-allowed'
                    : 'border-transparent hover:bg-slate-50 text-slate-500'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shrink-0"
                  style={{ backgroundColor: active ? tab.color : '#94a3b8' }}
                >
                  {tab.num}
                </div>
                <div>
                  <div className={`text-sm font-black flex items-center gap-1.5 ${active ? 'text-slate-900' : 'text-slate-600'}`}>
                    <Icon className="w-4 h-4" />
                    {tab.title}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">{tab.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        {selectedEvent ? (
          <div className="bg-gradient-to-r from-[#0D4F8B] via-[#118A96] to-[#0D4F8B] rounded-2xl p-5 text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F5D34B]">
                <span>{selectedEvent.estatus}</span>
                <span>•</span>
                <span>Project Manager Asignado: {selectedEvent.responsable}</span>
                <span>•</span>
                <span>{selectedEvent.fechaInicio} al {selectedEvent.fechaFin}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black mt-1">{selectedEvent.nombre}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {selectedEvent.sedes.length === 0 ? (
                  <span className="bg-white/15 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-200">
                    Sin sedes registradas aún — Agrégalas en el Paso 1B
                  </span>
                ) : (
                  selectedEvent.sedes.map((s) => (
                    <span key={s.id} className="bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#F5D34B]" />
                      {s.ciudad}: <strong className="text-[#F5D34B]">{s.hoteles.join(', ') || 'Sin hoteles'}</strong>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/15">
                <div className="text-[10px] uppercase text-white/75 font-bold">Presupuesto Autorizado</div>
                <div className="text-lg font-black mt-0.5">{formatCurrency(financialMetrics.presupuestoTotal)}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/15">
                <div className="text-[10px] uppercase text-white/75 font-bold">Gasto Real (Firmado)</div>
                <div className="text-lg font-black text-[#F5D34B] mt-0.5">{formatCurrency(financialMetrics.totalPagado)}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/15">
                <div className="text-[10px] uppercase text-white/75 font-bold">En Trámite de Firma</div>
                <div className="text-lg font-black text-orange-200 mt-0.5">{formatCurrency(financialMetrics.totalEnAutorizacion)}</div>
              </div>
              <div className={`backdrop-blur-sm p-3 rounded-xl border ${
                financialMetrics.ahorroSoloPagado < 0
                  ? 'bg-red-950/80 border-red-400'
                  : 'bg-emerald-950/60 border-emerald-400/40'
              }`}>
                <div className={`text-[10px] uppercase font-bold ${
                  financialMetrics.ahorroSoloPagado < 0 ? 'text-red-300' : 'text-emerald-300'
                }`}>
                  {financialMetrics.ahorroSoloPagado < 0 ? 'SOBREGIRO ACUMULADO' : 'Ahorro / Disponible Real'}
                </div>
                <div className={`text-lg font-black mt-0.5 ${
                  financialMetrics.ahorroSoloPagado < 0 ? 'text-red-300' : 'text-emerald-300'
                }`}>
                  {formatCurrency(financialMetrics.ahorroSoloPagado)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-slate-900 via-[#0D4F8B] to-[#118A96] rounded-2xl p-5 text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider bg-[#F5D34B] text-slate-950 px-2.5 py-0.5 rounded-md">
                Modo Alta de Evento Nuevo desde Cero
              </span>
              <h1 className="text-2xl font-black mt-2">
                Paso 1A: Registra los Datos Generales para Activar Sedes (1B) y Presupuesto (1C)
              </h1>
              <p className="text-xs text-slate-200 mt-1">
                Ningún evento previo está seleccionado y el presupuesto comienza en $0.00 sin rubros preestablecidos.
              </p>
            </div>
          </div>
        )}

        {/* =====================================================================
            MÓDULO 1: CREACIÓN DE EVENTO Y TABLA DE PARTIDAS (EDICIÓN PRESIDENTE)
        ===================================================================== */}
        {activeModule === 'CREACION_EVENTO' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border-2 border-[#0D4F8B] shadow-sm p-5 relative">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-[#0D4F8B] font-black text-base">
                    <PlusCircle className="w-5 h-5" />
                    1A. Datos del Evento Deportivo
                  </div>
                  {isStep1AButtonLocked && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Creado
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Primero da de alta el evento aquí. Al crearlo se desbloquearán las secciones <strong>1B</strong> y <strong>1C</strong>.
                </p>

                <form onSubmit={handleCreateNewEvent} className="space-y-3 text-sm">
                  <div>
                    <label className="text-xs font-bold text-slate-600">Nombre del Evento *</label>
                    <input
                      type="text"
                      disabled={isStep1AButtonLocked}
                      placeholder="Ej. Campeonato Nacional Atletismo 2026"
                      value={newEvtName}
                      onChange={(e) => setNewEvtName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl disabled:bg-slate-100 disabled:text-slate-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">Cliente / Federación</label>
                    <input
                      type="text"
                      disabled={isStep1AButtonLocked}
                      placeholder="Ej. CONADE / Federación Mexicana"
                      value={newEvtClient}
                      onChange={(e) => setNewEvtClient(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-600">Fecha Inicio</label>
                      <input
                        type="date"
                        disabled={isStep1AButtonLocked}
                        value={newEvtStart}
                        onChange={(e) => setNewEvtStart(e.target.value)}
                        className="w-full mt-1 px-2.5 py-2 border border-slate-300 rounded-xl text-xs disabled:bg-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600">Fecha Fin</label>
                      <input
                        type="date"
                        disabled={isStep1AButtonLocked}
                        value={newEvtEnd}
                        onChange={(e) => setNewEvtEnd(e.target.value)}
                        className="w-full mt-1 px-2.5 py-2 border border-slate-300 rounded-xl text-xs disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">Project Manager Asignado *</label>
                    <select
                      disabled={isStep1AButtonLocked || loggedInUser.rol === 'PROJECT_MANAGER'}
                      value={loggedInUser.rol === 'PROJECT_MANAGER' ? loggedInUser.nombre : newEvtResp}
                      onChange={(e) => setNewEvtResp(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl bg-white disabled:bg-slate-100"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.nombre}>{u.nombre} ({ROLE_LABELS[u.rol]})</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isStep1AButtonLocked}
                    className={`w-full font-black py-3 rounded-xl shadow-sm transition flex items-center justify-center gap-2 ${
                      isStep1AButtonLocked
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-not-allowed'
                        : 'bg-[#0D4F8B] hover:bg-[#093b69] text-white'
                    }`}
                  >
                    {isStep1AButtonLocked ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Evento Creado (Bloqueado para evitar duplicados)
                      </>
                    ) : (
                      'Crear Evento y Activar Pasos 1B y 1C'
                    )}
                  </button>

                  {isStep1AButtonLocked && (
                    <button
                      type="button"
                      onClick={handleStartNewEventFromZero}
                      className="w-full text-xs font-bold text-[#0D4F8B] hover:underline pt-1"
                    >
                      ¿Deseas limpiar todo para dar de alta otro evento distinto? Haz clic aquí
                    </button>
                  )}
                </form>
              </div>

              <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 relative transition ${
                isStep1BAnd1CLocked ? 'opacity-50 pointer-events-none select-none' : ''
              }`}>
                {isStep1BAnd1CLocked && (
                  <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] z-10 rounded-2xl flex items-center justify-center p-6 text-center">
                    <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg max-w-xs space-y-1">
                      <Lock className="w-5 h-5 text-[#F5D34B] mx-auto" />
                      <div className="text-xs font-black">Paso 1B Desactivado</div>
                      <p className="text-[11px] text-slate-300">
                        Primero crea el evento en el paso <strong>1A</strong> para habilitar la carga de ciudades y hoteles.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-[#118A96] font-black text-base mb-1">
                  <Hotel className="w-5 h-5" />
                  1B. Sedes (Ciudades) y Hoteles
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Configura las ciudades sede y los hoteles para <strong>{selectedEvent?.nombre || 'el nuevo evento'}</strong>.
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      disabled={isStep1BAnd1CLocked}
                      placeholder="Nueva ciudad (Ej. Guadalajara, Jal.)"
                      value={newCityName}
                      onChange={(e) => setNewCityName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      disabled={isStep1BAnd1CLocked}
                      onClick={handleAddCity}
                      className="bg-[#118A96] text-white font-bold px-3 py-2 rounded-xl text-xs shrink-0"
                    >
                      + Ciudad
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="text-[11px] font-bold text-slate-600">Agregar Hotel a Ciudad Sede:</div>
                    <select
                      disabled={isStep1BAnd1CLocked || !selectedEvent?.sedes.length}
                      value={selectedCityForHotel || selectedEvent?.sedes[0]?.ciudad || ''}
                      onChange={(e) => setSelectedCityForHotel(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-semibold"
                    >
                      {!selectedEvent?.sedes.length && (
                        <option value="">-- Primero agrega una ciudad arriba --</option>
                      )}
                      {selectedEvent?.sedes.map((s) => (
                        <option key={s.id} value={s.ciudad}>{s.ciudad}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        disabled={isStep1BAnd1CLocked || !selectedEvent?.sedes.length}
                        placeholder="Nombre del Hotel"
                        value={newHotelName}
                        onChange={(e) => setNewHotelName(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      />
                      <button
                        type="button"
                        disabled={isStep1BAnd1CLocked || !selectedEvent?.sedes.length}
                        onClick={handleAddHotelToCity}
                        className="bg-[#9B1B60] text-white font-bold px-3 py-1.5 rounded-lg text-xs shrink-0 disabled:opacity-50"
                      >
                        + Hotel
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {selectedEvent?.sedes.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      Aún no hay ciudades cargadas en este evento.
                    </div>
                  ) : (
                    selectedEvent?.sedes.map((s) => (
                      <div key={s.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
                        <div className="font-black text-xs text-[#0D4F8B] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#EE2743]" />
                          {s.ciudad}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {s.hoteles.length === 0 ? (
                            <span className="text-[11px] text-slate-400 italic">Sin hoteles asignados aún</span>
                          ) : (
                            s.hoteles.map((h, i) => (
                              <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[11px] font-medium text-slate-700 flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-[#118A96]" />
                                {h}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 relative transition ${
                isStep1BAnd1CLocked ? 'opacity-50 pointer-events-none select-none' : ''
              }`}>
                {isStep1BAnd1CLocked && (
                  <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] z-10 rounded-2xl flex items-center justify-center p-6 text-center">
                    <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg max-w-xs space-y-1">
                      <Lock className="w-5 h-5 text-[#F5D34B] mx-auto" />
                      <div className="text-xs font-black">Paso 1C Desactivado</div>
                      <p className="text-[11px] text-slate-300">
                        Primero crea el evento en el paso <strong>1A</strong> para asignar sus rubros presupuestales desde cero.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-[#9B1B60] font-black text-base mb-1">
                  <DollarSign className="w-5 h-5" />
                  1C. Rubros y Categorías de Presupuesto
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Agrega rubros nuevos al presupuesto. <strong>Solo el Presidente</strong> puede editar el monto de partidas ya existentes.
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {RUBROS_SUGERIDOS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      disabled={isStep1BAnd1CLocked}
                      onClick={() => setNewRubroName(sug)}
                      className="text-[10px] font-semibold px-2 py-1 rounded-md bg-slate-100 hover:bg-[#118A96] hover:text-white text-slate-700 transition"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleAddRubro} className="space-y-3 text-sm">
                  <div>
                    <label className="text-xs font-bold text-slate-600">Nombre del Rubro *</label>
                    <input
                      type="text"
                      disabled={isStep1BAnd1CLocked}
                      placeholder="Ej. Hospedaje / Vuelos de Jueces / Perdiem"
                      value={newRubroName}
                      onChange={(e) => setNewRubroName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">Presupuesto Autorizado (MXN) *</label>
                    <input
                      type="number"
                      step="0.01"
                      disabled={isStep1BAnd1CLocked}
                      placeholder="Ej. 250000"
                      value={newRubroBudget}
                      onChange={(e) => setNewRubroBudget(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">Descripción</label>
                    <input
                      type="text"
                      disabled={isStep1BAnd1CLocked}
                      placeholder="Alcance operativo del rubro"
                      value={newRubroDesc}
                      onChange={(e) => setNewRubroDesc(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isStep1BAnd1CLocked}
                    className="w-full bg-[#9B1B60] hover:bg-[#7d154d] text-white font-bold py-2.5 rounded-xl shadow-sm transition"
                  >
                    Agregar Rubro al Presupuesto
                  </button>
                </form>
              </div>
            </div>

            {selectedEvent && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <div>
                    <h3 className="font-black text-slate-900">Partidas Presupuestales del Evento — {selectedEvent.nombre}</h3>
                    <p className="text-xs text-slate-500">
                      {permissions.canEditBudgetAmounts
                        ? 'Modo Presidente Activo: Puedes editar directamente el monto de cualquier partida.'
                        : 'Partidas autorizadas. Solo Presidencia puede modificar los montos asignados.'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-semibold">Presupuesto Total Acumulado:</span>
                    <div className="text-xl font-black text-[#0D4F8B]">{formatCurrency(financialMetrics.presupuestoTotal)}</div>
                  </div>
                </div>

                {selectedEvent.rubrosPresupuesto.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 text-slate-600 text-xs uppercase">
                        <tr>
                          <th className="py-3 px-4 text-left">Rubro / Categoría</th>
                          <th className="py-3 px-4 text-left">Descripción</th>
                          <th className="py-3 px-4 text-right">Presupuesto Asignado</th>
                          <th className="py-3 px-4 text-right">Saldo Disponible</th>
                          {permissions.canEditBudgetAmounts && (
                            <th className="py-3 px-4 text-center">Edición (Presidente)</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {financialMetrics.porRubro.map((r) => (
                          <tr key={r.id} className={r.isOverdraft ? 'bg-red-50/70' : 'hover:bg-slate-50'}>
                            <td className="py-3 px-4 font-bold text-slate-900">{r.categoria}</td>
                            <td className="py-3 px-4 text-xs text-slate-500">{r.descripcion}</td>
                            <td className="py-3 px-4 text-right font-black text-[#0D4F8B]">{formatCurrency(r.presupuesto)}</td>
                            <td className={`py-3 px-4 text-right font-black ${r.disponibleRubro < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                              {formatCurrency(r.disponibleRubro)}
                            </td>
                            {permissions.canEditBudgetAmounts && (
                              <td className="py-3 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditRubroModal(r);
                                    setEditRubroAmount(String(r.presupuesto));
                                  }}
                                  className="px-3 py-1 rounded-lg text-xs font-black bg-[#0D4F8B]/10 hover:bg-[#0D4F8B] text-[#0D4F8B] hover:text-white inline-flex items-center gap-1 transition"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  Editar Monto
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            MÓDULO 2: GASTOS Y AUTORIZACIONES (RESTRICCIÓN PM + AVISO SOBREGIRO)
        ===================================================================== */}
        {activeModule === 'GASTOS_AUTORIZACION' && selectedEvent && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-[#9B1B60] font-black text-base">
                    <CreditCard className="w-5 h-5" />
                    Solicitar Pago / Registrar Gasto
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Solicitante: <strong>{loggedInUser.nombre} ({ROLE_LABELS[loggedInUser.rol]})</strong>. Evento asignado a: <strong>{selectedEvent.responsable}</strong>.
                </p>

                {!canUserRequestPaymentInCurrentEvent ? (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs space-y-1.5">
                    <div className="font-black flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-red-600" />
                      Evento No Asignado a tu Perfil
                    </div>
                    <p>
                      Los usuarios con rol <strong>Project Manager</strong> únicamente pueden solicitar pagos en los eventos a los cuales están asignados como responsables (este evento está asignado a <strong>{selectedEvent.responsable}</strong>).
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterExpense} className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-slate-600">Ciudad Sede</label>
                        <select
                          value={gastoCiudad || selectedEvent.sedes[0]?.ciudad || ''}
                          onChange={(e) => {
                            setGastoCiudad(e.target.value);
                            setGastoHotel('');
                          }}
                          className="w-full mt-1 px-2.5 py-2 border border-slate-300 rounded-xl text-xs bg-white font-semibold"
                        >
                          {selectedEvent.sedes.length === 0 && <option value="Sede General">Sede General</option>}
                          {selectedEvent.sedes.map((s) => (
                            <option key={s.id} value={s.ciudad}>{s.ciudad}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600">Hotel Sede</label>
                        <select
                          value={gastoHotel || activeSedeObj?.hoteles[0] || ''}
                          onChange={(e) => setGastoHotel(e.target.value)}
                          className="w-full mt-1 px-2.5 py-2 border border-slate-300 rounded-xl text-xs bg-white font-semibold"
                        >
                          {(activeSedeObj?.hoteles?.length ? activeSedeObj.hoteles : ['Hotel General']).map((h, i) => (
                            <option key={i} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Rubro del Presupuesto *</label>
                      <select
                        value={gastoCategoria || selectedEvent.rubrosPresupuesto[0]?.categoria || ''}
                        onChange={(e) => setGastoCategoria(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-[#0D4F8B]"
                      >
                        {financialMetrics.porRubro.length === 0 && (
                          <option value="">-- Sin rubros cargados en Paso 1C --</option>
                        )}
                        {financialMetrics.porRubro.map((r) => (
                          <option key={r.id} value={r.categoria}>
                            {r.categoria} (Disp: {formatCurrency(r.disponibleRubro)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Proveedor o Beneficiario *</label>
                      <input
                        type="text"
                        placeholder="Ej. Aeroméxico / Holiday Inn / Alamo"
                        value={gastoProveedor}
                        onChange={(e) => setGastoProveedor(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Concepto del Pago *</label>
                      <input
                        type="text"
                        placeholder="Descripción del pago solicitado"
                        value={gastoConcepto}
                        onChange={(e) => setGastoConcepto(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-slate-600">Monto Total (MXN) *</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={gastoMonto}
                          onChange={(e) => setGastoMonto(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl font-black text-slate-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600">Método de Pago</label>
                        <select
                          value={gastoFormaPago}
                          onChange={(e) => setGastoFormaPago(e.target.value)}
                          className="w-full mt-1 px-2.5 py-2 border border-slate-300 rounded-xl text-xs bg-white font-bold"
                        >
                          <option value="Transferencia">Transferencia (Cheques)</option>
                          <option value="Tarjeta Corporativa">Tarjeta de Crédito</option>
                          <option value="Efectivo / Reembolso">Efectivo / Reembolso</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600">Cuenta de Banco o Tarjeta (Todas Disponibles)</label>
                      <select
                        value={gastoCuenta || accounts[0]?.nombre || ''}
                        onChange={(e) => setGastoCuenta(e.target.value)}
                        className="w-full mt-1 px-2.5 py-2 border border-slate-300 rounded-xl text-xs bg-white font-semibold"
                      >
                        {accounts.map((c) => (
                          <option key={c.id} value={c.nombre}>
                            {c.nombre} — {c.bancoEmisor} ({c.tipoCuenta} • {c.pais})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#9B1B60] to-[#EE2743] hover:opacity-95 text-white font-black py-3 rounded-xl shadow-md transition"
                    >
                      Solicitar Pago
                    </button>
                  </form>
                )}
              </div>

              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-black text-base flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#F5D34B]" />
                      Matriz de Firmas de Pagos — {selectedEvent.nombre}
                    </h3>
                    <p className="text-xs text-slate-300">
                      1ra Firma: <strong>Director</strong> • 2da Firma: <strong>Director General</strong> • Firma Digital Final: <strong>Presidente</strong>
                    </p>
                  </div>
                  <span className="text-xs bg-white/10 px-3 py-1 rounded-lg font-bold text-[#F5D34B]">
                    Tu Rol: {ROLE_LABELS[loggedInUser.rol]}
                  </span>
                </div>

                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase">
                      <tr>
                        <th className="py-3 px-3 text-left">Folio / Sede</th>
                        <th className="py-3 px-3 text-left">Rubro / Proveedor</th>
                        <th className="py-3 px-3 text-left">Método / Cuenta</th>
                        <th className="py-3 px-3 text-right">Monto</th>
                        <th className="py-3 px-3 text-center">1ra Firma (Director)</th>
                        <th className="py-3 px-3 text-center">2da Firma (Dir. General)</th>
                        <th className="py-3 px-3 text-center">Firma Digital (Presidente)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedEvent.gastos.map((g) => {
                        const listasLasDosFirmas = g.authDirOp && g.authDirGen;
                        return (
                          <tr
                            key={g.id}
                            className={
                              g.esSobregiro
                                ? 'bg-red-50/70'
                                : g.firmaPresidente
                                ? 'bg-white'
                                : 'bg-amber-50/40'
                            }
                          >
                            <td className="py-3 px-3">
                              <div className="font-black text-slate-900 flex items-center gap-1">
                                {g.id}
                                {g.esSobregiro && (
                                  <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-black uppercase">
                                    Sobregiro
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-semibold text-[#118A96]">{g.sedeCiudad}</div>
                              <div className="text-[10px] text-slate-500">{g.hotel}</div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-[#0D4F8B] font-bold text-[10px] mb-1">
                                {g.categoria}
                              </span>
                              <div className="font-bold text-slate-900">{g.proveedor}</div>
                              <div className="text-slate-500">{g.concepto}</div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-800">{g.formaPago}</div>
                              <div className="text-[11px] text-slate-500">{g.cuenta}</div>
                            </td>
                            <td className={`py-3 px-3 text-right font-black text-sm ${g.esSobregiro ? 'text-red-700' : 'text-slate-900'}`}>
                              {formatCurrency(g.monto)}
                            </td>

                            <td className="py-3 px-3 text-center">
                              <button
                                disabled={g.firmaPresidente || !permissions.canFirstSign}
                                onClick={() => handleToggleAuth(g.id, 'FIRST_SIGN')}
                                className={`px-2.5 py-1.5 rounded-lg font-bold inline-flex items-center gap-1 transition ${
                                  g.authDirOp
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : permissions.canFirstSign
                                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                {g.authDirOp ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3" />}
                                {g.authDirOp ? 'Firmado' : '1ra Firma'}
                              </button>
                            </td>

                            <td className="py-3 px-3 text-center">
                              <button
                                disabled={g.firmaPresidente || !permissions.canSecondSign}
                                onClick={() => handleToggleAuth(g.id, 'SECOND_SIGN')}
                                className={`px-2.5 py-1.5 rounded-lg font-bold inline-flex items-center gap-1 transition ${
                                  g.authDirGen
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : permissions.canSecondSign
                                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                {g.authDirGen ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3" />}
                                {g.authDirGen ? 'Firmado' : '2da Firma'}
                              </button>
                            </td>

                            <td className="py-3 px-3 text-center">
                              {g.firmaPresidente ? (
                                <div className={`inline-flex flex-col items-center px-2.5 py-1 rounded-lg border ${
                                  g.esSobregiro
                                    ? 'bg-red-100 border-red-300'
                                    : 'bg-[#0D4F8B]/10 border-[#0D4F8B]/30'
                                }`}>
                                  <span className={`text-[10px] font-black flex items-center gap-1 ${
                                    g.esSobregiro ? 'text-red-700' : 'text-[#0D4F8B]'
                                  }`}>
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    {g.esSobregiro ? 'FIRMADO CON SOBREGIRO' : 'FIRMADO Y PAGADO'}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-500">{g.selloDigital}</span>
                                </div>
                              ) : (
                                <button
                                  disabled={!permissions.canPresidentSign}
                                  onClick={() => handleToggleAuth(g.id, 'PRESIDENTE')}
                                  className={`px-3 py-1.5 rounded-lg font-black inline-flex items-center gap-1.5 transition ${
                                    listasLasDosFirmas && permissions.canPresidentSign
                                      ? g.esSobregiro
                                        ? 'bg-red-600 hover:bg-red-700 text-white shadow'
                                        : 'bg-gradient-to-r from-[#0D4F8B] to-[#118A96] text-white shadow hover:opacity-95'
                                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  }`}
                                >
                                  {listasLasDosFirmas && permissions.canPresidentSign ? (
                                    <KeyRound className="w-3.5 h-3.5 text-[#F5D34B]" />
                                  ) : (
                                    <Lock className="w-3.5 h-3.5" />
                                  )}
                                  {listasLasDosFirmas
                                    ? g.esSobregiro
                                      ? 'Firmar Sobregiro'
                                      : 'Firmar Pago'
                                    : 'Faltan Firmas'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            MÓDULO 3: CONSULTA EJECUTIVA (RUBROS EXCEDIDOS EN ROJO + EDICIÓN PRESIDENTE)
        ===================================================================== */}
        {activeModule === 'CONSULTA_PRESIDENTE' && permissions.canViewExecutiveSummary && selectedEvent && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">Pagado por Transferencia / Cheques</span>
                  <div className="text-2xl font-black text-[#0D4F8B] mt-1">{formatCurrency(financialMetrics.porMetodo.Transferencia)}</div>
                  <span className="text-xs text-slate-500">Cuentas de Cheques MGO</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#0D4F8B]/10 text-[#0D4F8B] flex items-center justify-center">
                  <Landmark className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">Tarjetas de Crédito Corporativas</span>
                  <div className="text-2xl font-black text-[#9B1B60] mt-1">{formatCurrency(financialMetrics.porMetodo.Tarjeta)}</div>
                  <span className="text-xs text-slate-500">Tarjetas México y USA</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#9B1B60]/10 text-[#9B1B60] flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">Efectivo / Reembolsos</span>
                  <div className="text-2xl font-black text-[#118A96] mt-1">{formatCurrency(financialMetrics.porMetodo.Efectivo)}</div>
                  <span className="text-xs text-slate-500">Casetas, gasolina y papelería</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#118A96]/10 text-[#118A96] flex items-center justify-center">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#118A96]">
                    Vista Exclusiva de Presidencia en Tiempo Real
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    Cuadre de Cierre por Rubro: Presupuesto vs. Gasto Real — {selectedEvent.nombre}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Los rubros con sobregiro se destacan automáticamente en <strong>color rojo</strong>. Puedes ajustar cualquier monto presupuestal con el botón <strong>Editar</strong>.
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-xl text-right border ${
                  financialMetrics.ahorroSoloPagado < 0
                    ? 'bg-red-50 border-red-300'
                    : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className={`text-[11px] font-bold uppercase ${
                    financialMetrics.ahorroSoloPagado < 0 ? 'text-red-700' : 'text-emerald-700'
                  }`}>
                    {financialMetrics.ahorroSoloPagado < 0 ? 'Sobregiro Neto del Evento' : 'Ahorro Neto Logrado al Cierre'}
                  </div>
                  <div className={`text-xl font-black ${
                    financialMetrics.ahorroSoloPagado < 0 ? 'text-red-700' : 'text-emerald-700'
                  }`}>
                    {formatCurrency(financialMetrics.ahorroSoloPagado)}{' '}
                    ({financialMetrics.presupuestoTotal > 0 ? ((financialMetrics.ahorroSoloPagado / financialMetrics.presupuestoTotal) * 100).toFixed(2) : '0.00'}%)
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900 text-white text-xs uppercase">
                    <tr>
                      <th className="py-3.5 px-4 text-left">Rubro / Categoría</th>
                      <th className="py-3.5 px-4 text-right">Presupuesto Autorizado</th>
                      <th className="py-3.5 px-4 text-right">Gasto Real Pagado</th>
                      <th className="py-3.5 px-4 text-right">En Trámite de Firma</th>
                      <th className="py-3.5 px-4 text-right">Ahorro / Sobregiro</th>
                      <th className="py-3.5 px-4 text-center">% Ejercido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {financialMetrics.porRubro.map((r) => {
                      const excedido = r.ahorroRubro < 0;
                      return (
                        <tr
                          key={r.id}
                          className={excedido ? 'bg-red-50/90 hover:bg-red-100/70' : 'hover:bg-slate-50'}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`font-black ${excedido ? 'text-red-700' : 'text-slate-900'}`}>
                                {r.categoria}
                              </span>
                              {excedido && (
                                <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase">
                                  RUBRO EXCEDIDO
                                </span>
                              )}
                            </div>
                            <div className={`text-xs ${excedido ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                              {r.descripcion}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center justify-end gap-2">
                              <span className={`font-bold ${excedido ? 'text-red-800' : 'text-slate-700'}`}>
                                {formatCurrency(r.presupuesto)}
                              </span>
                              {permissions.canEditBudgetAmounts && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditRubroModal(r);
                                    setEditRubroAmount(String(r.presupuesto));
                                  }}
                                  className="p-1.5 rounded-lg bg-[#0D4F8B]/10 hover:bg-[#0D4F8B] text-[#0D4F8B] hover:text-white transition"
                                  title="Editar monto de esta partida (Exclusivo Presidente)"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className={`py-3.5 px-4 text-right font-black ${excedido ? 'text-red-700' : 'text-[#0D4F8B]'}`}>
                            {formatCurrency(r.pagadoRubro)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-semibold text-amber-600">
                            {formatCurrency(r.tramiteRubro)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {excedido ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 text-white font-black text-xs shadow-sm">
                                <TrendingUp className="w-3.5 h-3.5" />
                                Sobregiro: {formatCurrency(r.ahorroRubro)}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-black text-xs">
                                <TrendingDown className="w-3.5 h-3.5" />
                                Ahorro: {formatCurrency(r.ahorroRubro)}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 w-44">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    excedido ? 'bg-red-600' : 'bg-gradient-to-r from-[#0D4F8B] to-[#118A96]'
                                  }`}
                                  style={{ width: `${Math.min(100, r.porcentajeEjercido)}%` }}
                                />
                              </div>
                              <span className={`text-xs font-black w-14 text-right ${excedido ? 'text-red-700' : 'text-slate-700'}`}>
                                {r.porcentajeEjercido.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            MÓDULO 4: ADMINISTRACIÓN DE USUARIOS (BÓVEDA ENCRIPTADA FIREBASE AUTH)
        ===================================================================== */}
        {activeModule === 'USUARIOS_ROLES' && permissions.canManageUsers && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-2 text-[#F37338] font-black text-base mb-1">
                <UserPlus className="w-5 h-5" />
                Alta de Usuarios (Exclusivo Presidente)
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Al crear un usuario aquí, su contraseña se registra encriptada en <strong>Firebase Authentication</strong> y nunca se guarda en texto plano.
              </p>

              <form onSubmit={handleAddUser} className="space-y-3 text-sm">
                <div>
                  <label className="text-xs font-bold text-slate-600">Nombre Completo *</label>
                  <input
                    type="text"
                    placeholder="Ej. Roberto Gómez"
                    value={uNombre}
                    onChange={(e) => setUNombre(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Correo Corporativo (@mgoevents.com) *</label>
                  <input
                    type="email"
                    placeholder="roberto@mgoevents.com"
                    value={uEmail}
                    onChange={(e) => setUEmail(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Contraseña Inicial (mín. 6 caracteres) *</label>
                  <input
                    type="password"
                    placeholder="Asignar contraseña segura"
                    value={uPassword}
                    onChange={(e) => setUPassword(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Rol en el Sistema MGO *</label>
                  <select
                    value={uRol}
                    onChange={(e) => setURol(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-[#0D4F8B]"
                  >
                    <option value="PROJECT_MANAGER">1. Project Manager (Solo opera sus eventos asignados)</option>
                    <option value="DIRECTOR">2. Director (1ra Firma + Derechos de PM)</option>
                    <option value="DIRECTOR_GENERAL">3. Director General (2da Firma + Cuentas + Eliminar Eventos)</option>
                    <option value="PRESIDENTE">4. Presidente (Acceso Total y Edición de Presupuesto)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#F37338] hover:bg-[#d95f26] text-white font-black py-3 rounded-xl shadow-sm transition"
                >
                  Crear Usuario @mgoevents.com
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-black text-slate-900">Directorio Oficial de Usuarios y Roles (@mgoevents.com)</h3>
                <p className="text-xs text-slate-500">
                  Único usuario fundador activo: <strong>gramirez@mgoevents.com</strong>. Las contraseñas están blindadas mediante hash criptográfico en Firebase Auth.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                    <tr>
                      <th className="py-3 px-4 text-left">Usuario / Correo Oficial</th>
                      <th className="py-3 px-4 text-left">Rol Asignado</th>
                      <th className="py-3 px-4 text-left">Seguridad Credencial</th>
                      <th className="py-3 px-4 text-right">Acciones (Presidente)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="font-black text-slate-900">{u.nombre}</div>
                          <div className="text-xs font-semibold text-[#118A96]">{u.email}</div>
                          <div className="text-[11px] text-slate-400">{ROLE_RIGHTS_DESCRIPTION[u.rol]}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-black bg-[#0D4F8B]/10 text-[#0D4F8B]">
                            {ROLE_LABELS[u.rol]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs font-bold text-emerald-700">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Encriptada en Firebase Auth
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPasswordModalUser(u);
                                setNewPasswordInput('');
                              }}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-[#0D4F8B] hover:text-white text-slate-700 inline-flex items-center gap-1 transition"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              Restablecer Clave
                            </button>

                            <button
                              type="button"
                              disabled={u.id === loggedInUser.id || u.email.toLowerCase() === 'gramirez@mgoevents.com'}
                              onClick={() => setDeleteUserModal(u)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition ${
                                u.id === loggedInUser.id || u.email.toLowerCase() === 'gramirez@mgoevents.com'
                                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                  : 'bg-red-50 hover:bg-red-600 hover:text-white text-red-600'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            MÓDULO 5: ALTA DE CUENTA DE BANCO O TARJETA (DIR. GENERAL Y PRESIDENTE)
        ===================================================================== */}
        {activeModule === 'CUENTAS_BANCARIAS' && permissions.canManageBankAccounts && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-2 text-[#0D4F8B] font-black text-base mb-1">
                <Landmark className="w-5 h-5" />
                Alta de Cuenta de Banco o Tarjeta
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Módulo exclusivo para <strong>Dirección General</strong> y <strong>Presidente</strong>. Las cuentas creadas aquí estarán disponibles para todos los usuarios al registrar pagos.
              </p>

              <form onSubmit={handleAddBankAccount} className="space-y-3.5 text-sm">
                <div>
                  <label className="text-xs font-bold text-slate-600">1. Banco Emisor *</label>
                  <input
                    type="text"
                    placeholder="Ej. BBVA / American Express / Bank of America / Banorte"
                    value={accBancoEmisor}
                    onChange={(e) => setAccBancoEmisor(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 border border-slate-300 rounded-xl font-semibold focus:outline-none focus:border-[#0D4F8B]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">2. Tipo de Cuenta *</label>
                  <select
                    value={accTipoCuenta}
                    onChange={(e) => setAccTipoCuenta(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 border border-slate-300 rounded-xl bg-white font-bold text-[#0D4F8B]"
                  >
                    <option value="Cheques">1. Cheques</option>
                    <option value="Tarjeta de Crédito">2. Tarjeta de Crédito</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">3. País *</label>
                  <select
                    value={accPais}
                    onChange={(e) => setAccPais(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 border border-slate-300 rounded-xl bg-white font-bold text-slate-800"
                  >
                    <option value="México">México</option>
                    <option value="USA">USA</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">Alias / Terminación (Opcional para identificarla)</label>
                  <input
                    type="text"
                    placeholder="Ej. Terminación 4002 / Cuenta Eje MGO"
                    value={accNombre}
                    onChange={(e) => setAccNombre(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#0D4F8B] to-[#118A96] hover:opacity-95 text-white font-black py-3 rounded-xl shadow-md transition"
                >
                  Guardar Cuenta / Tarjeta Corporativa
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900">Catálogo Activo de Cuentas Bancarias y Tarjetas MGO</h3>
                  <p className="text-xs text-slate-500">
                    Habilitadas globalmente para todos los usuarios en el registro de gastos.
                  </p>
                </div>
                <span className="text-xs font-black px-3 py-1 rounded-full bg-[#0D4F8B]/10 text-[#0D4F8B]">
                  {accounts.length} Cuentas Activas
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                    <tr>
                      <th className="py-3 px-4 text-left">Identificador en Sistema</th>
                      <th className="py-3 px-4 text-left">1. Banco Emisor</th>
                      <th className="py-3 px-4 text-left">2. Tipo de Cuenta</th>
                      <th className="py-3 px-4 text-left">3. País</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {accounts.map((acc) => (
                      <tr key={acc.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-black text-slate-900">{acc.nombre}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{acc.bancoEmisor}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black ${
                            acc.tipoCuenta === 'Cheques'
                              ? 'bg-[#0D4F8B]/10 text-[#0D4F8B]'
                              : 'bg-[#9B1B60]/10 text-[#9B1B60]'
                          }`}>
                            {acc.tipoCuenta === 'Cheques' ? <Landmark className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
                            {acc.tipoCuenta}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                            <Globe className="w-3.5 h-3.5 text-[#118A96]" />
                            {acc.pais}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteBankAccount(acc)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-50 hover:bg-red-600 hover:text-white text-red-600 inline-flex items-center gap-1 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}