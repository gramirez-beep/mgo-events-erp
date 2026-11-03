import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  CreditCard,
  PlusCircle,
  FileSpreadsheet,
  DollarSign,
  Users,
  Calendar,
  MapPin,
  ArrowUpRight,
  Check,
  X,
  Eye,
  Briefcase,
  KeyRound,
  Layers,
  Sparkles,
  FileCheck2,
  Wallet,
  Landmark,
  Hotel,
  Plane,
  Utensils,
  Award,
  Trash2,
  UserPlus,
  ShieldAlert,
  TrendingDown,
  BarChart3,
  Cloud,
  RefreshCw,
  Download,
} from 'lucide-react';

// ============================================================================
// 1. CONFIGURACIÓN DE FIREBASE (TUS LLAVES PROPIAS MGO)
// ============================================================================
const firebaseConfig = {
  apiKey: 'AIzaSyBSIy2-TfVCxZUvuVbr6ejDhwKmEwbVvKk',
  authDomain: 'mgo-events-sistema.firebaseapp.com',
  projectId: 'mgo-events-sistema',
  storageBucket: 'mgo-events-sistema.firebasestorage.app',
  messagingSenderId: '768292798090',
  appId: '1:768292798090:web:3199b4c6f7da10e1267773',
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
  const dimensions = size === 'lg' ? 'w-14 h-14' : 'w-11 h-11';
  const titleSize = size === 'lg' ? 'text-4xl' : 'text-2xl';
  const subSize = size === 'lg' ? 'text-xs' : 'text-[10px]';

  return (
    <div className="flex items-center gap-3 select-none">
      <svg
        viewBox="0 0 120 120"
        className={`${dimensions} shrink-0 drop-shadow-sm`}
        fill="none"
      >
        <path d="M12 24 L12 96 L52 60 Z" fill="#0D4F8B" />
        <path
          d="M12 96 C12 108 26 114 36 104 L104 36 C114 26 108 12 96 12 C88 12 82 16 76 22 L16 82 Z"
          fill="#118A96"
        />
        <path
          d="M72 60 L72 96 C72 106 82 110 90 104 L104 90 L72 58 Z"
          fill="#F5D34B"
        />
        <path
          d="M108 24 L108 96 C108 106 96 112 86 104 C80 99 78 92 78 84 L78 48 Z"
          fill="#F37338"
        />
        <path
          d="M60 60 L92 16 C98 10 108 14 108 24 C108 30 104 36 98 42 L74 74 Z"
          fill="#EE2743"
        />
        <path
          d="M16 16 C24 8 36 10 44 18 L92 66 L74 84 L16 26 C10 20 12 18 16 16 Z"
          fill="#9B1B60"
        />
      </svg>
      <div className="leading-none">
        <div
          className={`${titleSize} font-black tracking-tight flex items-center`}
        >
          <span style={{ color: '#118A96' }}>M</span>
          <span style={{ color: '#0D4F8B' }}>GO</span>
        </div>
        <div
          className={`${subSize} font-semibold text-slate-500 tracking-tight mt-0.5`}
        >
          High Performance
          <br />
          Sports Logistics
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. DATOS INICIALES (PARALIMPIADA EXCEL REAL + OLIMPIADA NACIONAL MULTISEDE)
// ============================================================================
const INITIAL_USERS = [
  {
    id: 'u1',
    nombre: 'Pepe',
    cargo: 'Coordinador Operativo',
    email: 'pepe@mgoevents.com',
    rol: 'SOLICITANTE',
    nivelAutorizacion: 'Nivel 1: Captura y Solicitud de Gastos',
    tarjetaAsignada: 'Manu 1251 / Clari Amex',
    activo: true,
  },
  {
    id: 'u2',
    nombre: 'Manu',
    cargo: 'Director de Operaciones',
    email: 'manu@mgoevents.com',
    rol: 'DIR_OPERACIONES',
    nivelAutorizacion: 'Nivel 2: 1ra Firma Obligatoria (Operaciones)',
    tarjetaAsignada: 'Manu 1251 / Manu 4610',
    activo: true,
  },
  {
    id: 'u3',
    nombre: 'Clarisa',
    cargo: 'Dirección General',
    email: 'clarisa@mgoevents.com',
    rol: 'DIR_GENERAL',
    nivelAutorizacion: 'Nivel 3: 2da Firma Obligatoria (Dirección General)',
    tarjetaAsignada: 'Clari Amex / Amex 4002',
    activo: true,
  },
  {
    id: 'u4',
    nombre: 'Presidente MGO',
    cargo: 'Presidente del Consejo',
    email: 'presidente@mgoevents.com',
    rol: 'PRESIDENTE',
    nivelAutorizacion: 'Nivel 4: Firma Digital Liberadora de Pago',
    tarjetaAsignada: 'BOFA 9273 / MGO Digital',
    activo: true,
  },
  {
    id: 'u5',
    nombre: 'Carlos',
    cargo: 'Logística de Vuelos y Sedes',
    email: 'carlos@mgoevents.com',
    rol: 'SOLICITANTE',
    nivelAutorizacion: 'Nivel 1: Captura y Solicitud de Gastos',
    tarjetaAsignada: 'Clari Amex',
    activo: true,
  },
];

const INITIAL_EVENTS = [
  {
    id: 'EVT-PARALIMPIADA-2026',
    nombre: 'Inscripciones Paralimpiada',
    cliente: 'CONADE / Comité Paralímpico',
    fechaInicio: '2026-09-07',
    fechaFin: '2026-09-10',
    responsable: 'Pepe',
    moneda: 'MXN',
    estatus: 'En Cierre / Liquidación',
    sedes: [
      {
        id: 'sede-cdmx',
        ciudad: 'Ciudad de México',
        hoteles: ['Holiday Inn Dalí'],
      },
    ],
    rubrosPresupuesto: [
      {
        id: 'rub-1',
        categoria: 'Hospedaje',
        presupuesto: 560000,
        descripcion:
          'Hospedaje, alimentos, tomas de corriente, red y coffee break',
      },
      {
        id: 'rub-2',
        categoria: 'Vuelos de Empleados',
        presupuesto: 85000,
        descripcion: 'Vuelos staff MGO e inscripciones',
      },
      {
        id: 'rub-3',
        categoria: 'Materiales y Papelería',
        presupuesto: 75000,
        descripcion: 'Tintas HP/Xerox, sellos, pendones y papelería',
      },
      {
        id: 'rub-4',
        categoria: 'Transporte Terrestre',
        presupuesto: 35000,
        descripcion: 'Renta camioneta Alamo, gasolina y casetas',
      },
      {
        id: 'rub-5',
        categoria: 'Viáticos de Empleados / Perdiem',
        presupuesto: 25000,
        descripcion: 'Alimentación y perdiem equipo operativo',
      },
      {
        id: 'rub-6',
        categoria: 'Fee del Evento',
        presupuesto: 20000,
        descripcion: 'Cargos operativos y gestión',
      },
    ],
    gastos: [
      {
        id: 'R47',
        fecha: '2026-09-14',
        sedeCiudad: 'Ciudad de México',
        hotel: 'Holiday Inn Dalí',
        categoria: 'Hospedaje',
        proveedor: 'Holiday Inn Dali',
        concepto: 'Inscripciones Paralimpiada',
        descripcion:
          'Hospedaje, alimentos, tomas de corriente, conexion de red y coffee break',
        monto: 527256.44,
        formaPago: 'Transferencia',
        cuenta: 'MGO Digital',
        pagadoPor: 'Manu',
        solicitadoPor: 'Pepe',
        comprobante: 'Factura',
        authDirOp: true,
        authDirGen: true,
        firmaPresidente: true,
        selloDigital: 'MGO-SIG-948201-PRES',
        estatus: 'Pagado',
      },
      {
        id: 'R48',
        fecha: '2026-09-02',
        sedeCiudad: 'Ciudad de México',
        hotel: 'Holiday Inn Dalí',
        categoria: 'Vuelos de Empleados',
        proveedor: 'Aeromexico',
        concepto: 'Vuelos MGO',
        descripcion: 'Clave reserva GNPFIM',
        monto: 21152.0,
        formaPago: 'Tarjeta Corporativa',
        cuenta: 'Clari Amex',
        pagadoPor: 'Pepe',
        solicitadoPor: 'Pepe',
        comprobante: 'Factura',
        authDirOp: true,
        authDirGen: true,
        firmaPresidente: true,
        selloDigital: 'MGO-SIG-948202-PRES',
        estatus: 'Pagado',
      },
      {
        id: 'R49',
        fecha: '2026-09-04',
        sedeCiudad: 'Ciudad de México',
        hotel: 'Holiday Inn Dalí',
        categoria: 'Materiales y Papelería',
        proveedor: 'Papelerias Bety',
        concepto: 'Papeleria',
        descripcion: 'Papelería general para registro',
        monto: 7793.35,
        formaPago: 'Tarjeta Corporativa',
        cuenta: 'Manu 1251',
        pagadoPor: 'Pepe',
        solicitadoPor: 'Pepe',
        comprobante: 'Factura',
        authDirOp: true,
        authDirGen: true,
        firmaPresidente: true,
        selloDigital: 'MGO-SIG-948203-PRES',
        estatus: 'Pagado',
      },
      {
        id: 'R50',
        fecha: '2026-09-04',
        sedeCiudad: 'Ciudad de México',
        hotel: 'Holiday Inn Dalí',
        categoria: 'Materiales y Papelería',
        proveedor: 'Office Depot',
        concepto: 'Tintas de impresora',
        descripcion: '36 cartuchos Impresoras HP',
        monto: 24174.0,
        formaPago: 'Tarjeta Corporativa',
        cuenta: 'Manu 1251',
        pagadoPor: 'Pepe',
        solicitadoPor: 'Pepe',
        comprobante: 'Factura',
        authDirOp: true,
        authDirGen: true,
        firmaPresidente: true,
        selloDigital: 'MGO-SIG-948204-PRES',
        estatus: 'Pagado',
      },
      {
        id: 'R51',
        fecha: '2026-09-07',
        sedeCiudad: 'Ciudad de México',
        hotel: 'Holiday Inn Dalí',
        categoria: 'Materiales y Papelería',
        proveedor: 'FAMA COLOR',
        concepto: 'Papeleria',
        descripcion: '20 Sellos y Pendones oficiales',
        monto: 11843.02,
        formaPago: 'Tarjeta Corporativa',
        cuenta: 'Manu 1251',
        pagadoPor: 'Pepe',
        solicitadoPor: 'Pepe',
        comprobante: 'Factura',
        authDirOp: true,
        authDirGen: true,
        firmaPresidente: true,
        selloDigital: 'MGO-SIG-948205-PRES',
        estatus: 'Pagado',
      },
      {
        id: 'R52',
        fecha: '2026-09-03',
        sedeCiudad: 'Ciudad de México',
        hotel: 'Holiday Inn Dalí',
        categoria: 'Materiales y Papelería',
        proveedor: 'Mercado Libre',
        concepto: 'Tintas de impresora',
        descripcion: '5 Tintas Impresoras Xerox',
        monto: 16820.29,
        formaPago: 'Tarjeta Corporativa',
        cuenta: 'BOFA 9273',
        pagadoPor: 'Pepe',
        solicitadoPor: 'Pepe',
        comprobante: 'Factura',
        authDirOp: true,
        authDirGen: true,
        firmaPresidente: true,
        selloDigital: 'MGO-SIG-948206-PRES',
        estatus: 'Pagado',
      },
      {
        id: 'R53',
        fecha: '2026-09-07',
        sedeCiudad: 'Ciudad de México',
        hotel: 'Holiday Inn Dalí',
        categoria: 'Vuelos de Empleados',
        proveedor: 'Viva Aerobus',
        concepto: 'Vuelos Paralimpiada',
        descripcion: 'Vuelo David, Maria Guadalupe y Leslie',
        monto: 16080.61,
        formaPago: 'Tarjeta Corporativa',
        cuenta: 'Clari Amex',
        pagadoPor: 'Carlos',
        solicitadoPor: 'Pepe',
        comprobante: 'Factura',
        authDirOp: true,
        authDirGen: true,
        firmaPresidente: true,
        selloDigital: 'MGO-SIG-948207-PRES',
        estatus: 'Pagado',
      },
      {
        id: 'R54',
        fecha: '2026-09-07',
        sedeCiudad: 'Ciudad de México',
        hotel: 'Holiday Inn Dalí',
        categoria: 'Vuelos de Empleados',
        proveedor: 'Aeromexico',
        concepto: 'Vuelos Paralimpiada',
        descripcion: 'Vuelo Anaisa, Jose Israel y Diana',
        monto: 20874.0,
        formaPago: 'Tarjeta Corporativa',
        cuenta: 'Clari Amex',
        pagadoPor: 'Carlos',
        solicitadoPor: 'Pepe',
        comprobante: 'Factura',
        authDirOp: true,
        authDirGen: true,
        firmaPresidente: true,
        selloDigital: 'MGO-SIG-948208-PRES',
        estatus: 'Pagado',
      },
      {
        id: 'R55',
        fecha: '2026-09-17',
        sedeCiudad: 'Ciudad de México',
        hotel: 'Holiday Inn Dalí',
        categoria: 'Transporte Terrestre',
        proveedor: 'Alamo',
        concepto: 'Inscripciones Guadalajara - Mexico',
        descripcion: 'Renta vehículo para llevar impresora',
        monto: 12499.99,
        formaPago: 'Tarjeta Corporativa',
        cuenta: 'Amex 4002',
        pagadoPor: 'Clarisa',
        solicitadoPor: 'Pepe',
        comprobante: 'Factura',
        authDirOp: true,
        authDirGen: true,
        firmaPresidente: true,
        selloDigital: 'MGO-SIG-948209-PRES',
        estatus: 'Pagado',
      },
      {
        id: 'R56',
        fecha: '2026-09-12',
        sedeCiudad: 'Ciudad de México',
        hotel: 'Holiday Inn Dalí',
        categoria: 'Transporte Terrestre',
        proveedor: 'Gasolina',
        concepto: 'Arturo CONADE',
        descripcion: 'Transporte para inscripciones',
        monto: 600.0,
        formaPago: 'Efectivo / Reembolso',
        cuenta: 'Cash',
        pagadoPor: 'Clarisa',
        solicitadoPor: 'Pepe',
        comprobante: 'Factura',
        authDirOp: true,
        authDirGen: true,
        firmaPresidente: true,
        selloDigital: 'MGO-SIG-948210-PRES',
        estatus: 'Pagado',
      },
      {
        id: 'R57',
        fecha: '2026-09-10',
        sedeCiudad: 'Ciudad de México',
        hotel: 'Holiday Inn Dalí',
        categoria: 'Materiales y Papelería',
        proveedor: 'Papeleria',
        concepto: 'Papeleria Extra',
        descripcion: 'Insumos urgentes en sede',
        monto: 691.0,
        formaPago: 'Efectivo / Reembolso',
        cuenta: 'Cash',
        pagadoPor: 'Clarisa',
        solicitadoPor: 'Pepe',
        comprobante: 'Recibo',
        authDirOp: true,
        authDirGen: true,
        firmaPresidente: true,
        selloDigital: 'MGO-SIG-948211-PRES',
        estatus: 'Pagado',
      },
      {
        id: 'R58',
        fecha: '2026-09-06',
        sedeCiudad: 'Ciudad de México',
        hotel: 'Holiday Inn Dalí',
        categoria: 'Transporte Terrestre',
        proveedor: 'Casetas',
        concepto: 'Casetas MGO',
        descripcion: 'Peajes traslado equipo Guadalajara - CDMX',
        monto: 2308.0,
        formaPago: 'Efectivo / Reembolso',
        cuenta: 'Cash',
        pagadoPor: 'Clarisa',
        solicitadoPor: 'Pepe',
        comprobante: 'Factura',
        authDirOp: true,
        authDirGen: true,
        firmaPresidente: true,
        selloDigital: 'MGO-SIG-948212-PRES',
        estatus: 'Pagado',
      },
      {
        id: 'R59',
        fecha: '2026-09-06',
        sedeCiudad: 'Ciudad de México',
        hotel: 'Holiday Inn Dalí',
        categoria: 'Transporte Terrestre',
        proveedor: 'Gasolina',
        concepto: 'Gasolina MGO',
        descripcion: 'Carga combustible traslado equipo',
        monto: 4647.85,
        formaPago: 'Efectivo / Reembolso',
        cuenta: 'Cash',
        pagadoPor: 'Clarisa',
        solicitadoPor: 'Pepe',
        comprobante: 'Factura',
        authDirOp: true,
        authDirGen: true,
        firmaPresidente: true,
        selloDigital: 'MGO-SIG-948213-PRES',
        estatus: 'Pagado',
      },
      {
        id: 'R60',
        fecha: '2026-09-06',
        sedeCiudad: 'Ciudad de México',
        hotel: 'Holiday Inn Dalí',
        categoria: 'Vuelos de Empleados',
        proveedor: 'Volaris',
        concepto: 'Vuelos Manu',
        descripcion: 'Boleto aéreo supervisión operativa Manu',
        monto: 2692.0,
        formaPago: 'Tarjeta Corporativa',
        cuenta: 'Manu 4610',
        pagadoPor: 'Manu',
        solicitadoPor: 'Pepe',
        comprobante: 'Factura',
        authDirOp: true,
        authDirGen: true,
        firmaPresidente: true,
        selloDigital: 'MGO-SIG-948214-PRES',
        estatus: 'Pagado',
      },
      {
        id: 'R61-PEND',
        fecha: '2026-09-18',
        sedeCiudad: 'Ciudad de México',
        hotel: 'Holiday Inn Dalí',
        categoria: 'Viáticos de Empleados / Perdiem',
        proveedor: 'Perdiem Staff Operativo',
        concepto: 'Liquidación Viáticos Cierre CDMX',
        descripcion: 'Perdiem 6 integrantes staff cierre de evento',
        monto: 14500.0,
        formaPago: 'Transferencia',
        cuenta: 'MGO Digital',
        pagadoPor: 'Manu',
        solicitadoPor: 'Pepe',
        comprobante: 'Recibo',
        authDirOp: true,
        authDirGen: false,
        firmaPresidente: false,
        selloDigital: null,
        estatus: 'Pendiente Autorización',
      },
      {
        id: 'R62-PEND',
        fecha: '2026-09-18',
        sedeCiudad: 'Ciudad de México',
        hotel: 'Holiday Inn Dalí',
        categoria: 'Fee del Evento',
        proveedor: 'Auditoria & Logística Deportiva SC',
        concepto: 'Honorarios Cierre Documental CONADE',
        descripcion: 'Entrega de carpetas y actas de cierre',
        monto: 18000.0,
        formaPago: 'Transferencia',
        cuenta: 'MGO Digital',
        pagadoPor: 'Manu',
        solicitadoPor: 'Pepe',
        comprobante: 'Factura',
        authDirOp: true,
        authDirGen: true,
        firmaPresidente: false,
        selloDigital: null,
        estatus: 'Listo para Firma Presidente',
      },
    ],
  },
  {
    id: 'EVT-OLIMPIADA-NAC-2026',
    nombre: 'Olimpiada Nacional de México 2026',
    cliente: 'CONADE / Institutos Estatales del Deporte',
    fechaInicio: '2026-10-15',
    fechaFin: '2026-11-05',
    responsable: 'Manu',
    moneda: 'MXN',
    estatus: 'En Operación Activa',
    sedes: [
      {
        id: 'sede-gdl',
        ciudad: 'Guadalajara, Jal.',
        hoteles: [
          'Hotel RIU Plaza Guadalajara',
          'Hard Rock Hotel Guadalajara',
          'Fiesta Americana Minerva',
        ],
      },
      {
        id: 'sede-mty',
        ciudad: 'Monterrey, N.L.',
        hoteles: ['Camino Real Monterrey', 'Safi Royal Luxury Valle'],
      },
      {
        id: 'sede-mid',
        ciudad: 'Mérida, Yuc.',
        hoteles: ['Fiesta Americana Mérida', 'Holiday Inn Mérida'],
      },
    ],
    rubrosPresupuesto: [
      {
        id: 'on-1',
        categoria: 'Hospedaje',
        presupuesto: 2800000,
        descripcion:
          'Bloqueo de habitaciones atletas, jueces y comité en 3 ciudades',
      },
      {
        id: 'on-2',
        categoria: 'Alimentación',
        presupuesto: 950000,
        descripcion: 'Comedores deportivos y buffets en hoteles sede',
      },
      {
        id: 'on-3',
        categoria: 'Transporte Terrestre',
        presupuesto: 620000,
        descripcion: 'Autobuses aeropuerto-hotel-sede deportiva y vanes VIP',
      },
      {
        id: 'on-4',
        categoria: 'Vuelos de Jueces',
        presupuesto: 480000,
        descripcion: 'Boletos aéreos jueces nacionales e internacionales',
      },
      {
        id: 'on-5',
        categoria: 'Vuelos de Empleados',
        presupuesto: 210000,
        descripcion: 'Staff MGO asignado a Guadalajara, Monterrey y Mérida',
      },
      {
        id: 'on-6',
        categoria: 'Perdiem',
        presupuesto: 340000,
        descripcion: 'Perdiem diario para jueces y delegados técnicos',
      },
      {
        id: 'on-7',
        categoria: 'Viáticos de Empleados',
        presupuesto: 190000,
        descripcion: 'Viáticos coordinadores de sede MGO',
      },
      {
        id: 'on-8',
        categoria: 'Fee del Evento',
        presupuesto: 650000,
        descripcion: 'Fee de agencia y operación logística integral MGO Events',
      },
    ],
    gastos: [
      {
        id: 'ON-101',
        fecha: '2026-10-02',
        sedeCiudad: 'Guadalajara, Jal.',
        hotel: 'Hotel RIU Plaza Guadalajara',
        categoria: 'Hospedaje',
        proveedor: 'RIU Hotels & Resorts',
        concepto: 'Anticipo 50% Bloqueo Delegaciones y Jueces',
        descripcion: '220 habitaciones plan pensión completa',
        monto: 1250000.0,
        formaPago: 'Transferencia',
        cuenta: 'MGO Digital',
        pagadoPor: 'Manu',
        solicitadoPor: 'Pepe',
        comprobante: 'Factura',
        authDirOp: true,
        authDirGen: true,
        firmaPresidente: true,
        selloDigital: 'MGO-SIG-88101-PRES',
        estatus: 'Pagado',
      },
      {
        id: 'ON-102',
        fecha: '2026-10-04',
        sedeCiudad: 'Monterrey, N.L.',
        hotel: 'Camino Real Monterrey',
        categoria: 'Hospedaje',
        proveedor: 'Hoteles Camino Real',
        concepto: 'Liquidación Hospedaje Jueces Federación',
        descripcion: '85 habitaciones sede Monterrey',
        monto: 680000.0,
        formaPago: 'Transferencia',
        cuenta: 'MGO Digital',
        pagadoPor: 'Manu',
        solicitadoPor: 'Carlos',
        comprobante: 'Factura',
        authDirOp: true,
        authDirGen: true,
        firmaPresidente: true,
        selloDigital: 'MGO-SIG-88102-PRES',
        estatus: 'Pagado',
      },
      {
        id: 'ON-103',
        fecha: '2026-10-06',
        sedeCiudad: 'Mérida, Yuc.',
        hotel: 'Fiesta Americana Mérida',
        categoria: 'Vuelos de Jueces',
        proveedor: 'Aeromexico Grupos',
        concepto: 'Emisión 42 Boletos Jueces Nacionales',
        descripcion: 'Rutas CDMX-MID y GDL-MID',
        monto: 264500.0,
        formaPago: 'Tarjeta Corporativa',
        cuenta: 'Clari Amex',
        pagadoPor: 'Clarisa',
        solicitadoPor: 'Carlos',
        comprobante: 'Factura',
        authDirOp: true,
        authDirGen: true,
        firmaPresidente: false,
        selloDigital: null,
        estatus: 'Listo para Firma Presidente',
      },
    ],
  },
];

const CUENTAS_CORPORATIVAS = [
  {
    nombre: 'MGO Digital',
    tipo: 'Transferencia',
    banco: 'Cuenta Eje SPEI Empresarial MGO',
  },
  {
    nombre: 'Clari Amex',
    tipo: 'Tarjeta Corporativa',
    banco: 'American Express Corporativa (Clarisa)',
  },
  {
    nombre: 'Manu 1251',
    tipo: 'Tarjeta Corporativa',
    banco: 'TDC Corporativa Operaciones Terminación 1251',
  },
  {
    nombre: 'BOFA 9273',
    tipo: 'Tarjeta Corporativa',
    banco: 'Bank of America Corporate Terminación 9273',
  },
  {
    nombre: 'Amex 4002',
    tipo: 'Tarjeta Corporativa',
    banco: 'American Express Ejecutiva Terminación 4002',
  },
  {
    nombre: 'Manu 4610',
    tipo: 'Tarjeta Corporativa',
    banco: 'TDC Corporativa Viajes Terminación 4610',
  },
  {
    nombre: 'Cash',
    tipo: 'Efectivo / Reembolso',
    banco: 'Fondo Fijo Caja Chica / Reembolso',
  },
];

const RUBROS_SUGERIDOS = [
  'Hospedaje',
  'Alimentación',
  'Transporte Terrestre',
  'Fee del Evento',
  'Perdiem',
  'Viáticos de Empleados',
  'Vuelos de Jueces',
  'Vuelos de Empleados',
  'Materiales y Papelería',
  'Producción e Imagen',
  'Renta de Equipo',
  'hidratación y Médicos',
];

const formatCurrency = (val, currency = 'MXN') =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number(val) || 0);

export default function App() {
  const [activeModule, setActiveModule] = useState('CONSULTA_PRESIDENTE');
  const [currentRole, setCurrentRole] = useState('PRESIDENTE');
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('mgo_events_cloud_sync');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });
  const [users, setUsers] = useState(INITIAL_USERS);
  const [selectedEventId, setSelectedEventId] = useState(
    'EVT-PARALIMPIADA-2026'
  );
  const [notification, setNotification] = useState(null);
  const [blockedModal, setBlockedModal] = useState(null);
  const [cloudStatus, setCloudStatus] = useState('connecting');

  // Conexión y sincronización en tiempo real con Firebase Firestore
  useEffect(() => {
    if (!auth || !db) {
      setCloudStatus('local');
      return;
    }
    signInAnonymously(auth)
      .then(() => {
        const eventsRef = collection(
          db,
          'artifacts',
          appId,
          'public',
          'data',
          'mgo_events'
        );
        onSnapshot(
          eventsRef,
          (snapshot) => {
            if (!snapshot.empty) {
              const cloudData = snapshot.docs.map((d) => d.data());
              setEvents(cloudData);
              localStorage.setItem(
                'mgo_events_cloud_sync',
                JSON.stringify(cloudData)
              );
            }
            setCloudStatus('synced');
          },
          (err) => {
            console.warn('Error en snapshot:', err);
            setCloudStatus('local');
          }
        );
      })
      .catch((e) => {
        console.warn('Auth anónimo falló:', e);
        setCloudStatus('local');
      });
  }, []);

  const syncEventToCloud = async (updatedEvent) => {
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === updatedEvent.id);
      const next = exists
        ? prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
        : [...prev, updatedEvent];
      localStorage.setItem('mgo_events_cloud_sync', JSON.stringify(next));
      return next;
    });

    if (db && cloudStatus === 'synced') {
      try {
        await setDoc(
          doc(
            db,
            'artifacts',
            appId,
            'public',
            'data',
            'mgo_events',
            updatedEvent.id
          ),
          updatedEvent
        );
      } catch (e) {
        console.error('Error guardando en Firebase:', e);
      }
    }
  };

  const showToast = (type, title, message) => {
    setNotification({ type, title, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || events[0],
    [events, selectedEventId]
  );

  // ============================================================================
  // CÁLCULOS FINANCIEROS EN TIEMPO REAL DEL EVENTO ACTIVO
  // ============================================================================
  const financialMetrics = useMemo(() => {
    if (!selectedEvent) return null;
    const presupuestoTotal = selectedEvent.rubrosPresupuesto.reduce(
      (acc, r) => acc + Number(r.presupuesto || 0),
      0
    );
    const gastosPagados = selectedEvent.gastos.filter((g) => g.firmaPresidente);
    const gastosEnTrámite = selectedEvent.gastos.filter(
      (g) => !g.firmaPresidente
    );

    const totalPagado = gastosPagados.reduce(
      (acc, g) => acc + Number(g.monto || 0),
      0
    );
    const totalEnAutorizacion = gastosEnTrámite.reduce(
      (acc, g) => acc + Number(g.monto || 0),
      0
    );
    const totalComprometido = totalPagado + totalEnAutorizacion;
    const ahorroSoloPagado = presupuestoTotal - totalPagado;
    const disponibleParaComprometer = presupuestoTotal - totalComprometido;

    const porRubro = selectedEvent.rubrosPresupuesto.map((r) => {
      const pagadoRubro = gastosPagados
        .filter((g) => g.categoria === r.categoria)
        .reduce((a, b) => a + Number(b.monto), 0);
      const tramiteRubro = gastosEnTrámite
        .filter((g) => g.categoria === r.categoria)
        .reduce((a, b) => a + Number(b.monto), 0);
      const comprometidoRubro = pagadoRubro + tramiteRubro;
      const disponibleRubro = r.presupuesto - comprometidoRubro;
      const ahorroRubro = r.presupuesto - pagadoRubro;
      return {
        ...r,
        pagadoRubro,
        tramiteRubro,
        comprometidoRubro,
        disponibleRubro,
        ahorroRubro,
        porcentajeEjercido:
          r.presupuesto > 0 ? (pagadoRubro / r.presupuesto) * 100 : 0,
      };
    });

    const porMetodo = {
      Transferencia: gastosPagados
        .filter((g) => g.formaPago === 'Transferencia')
        .reduce((a, b) => a + Number(b.monto), 0),
      Tarjeta: gastosPagados
        .filter((g) => g.formaPago === 'Tarjeta Corporativa')
        .reduce((a, b) => a + Number(b.monto), 0),
      Efectivo: gastosPagados
        .filter((g) => g.formaPago === 'Efectivo / Reembolso')
        .reduce((a, b) => a + Number(b.monto), 0),
    };

    return {
      presupuestoTotal,
      totalPagado,
      totalEnAutorizacion,
      totalComprometido,
      ahorroSoloPagado,
      disponibleParaComprometer,
      porRubro,
      porMetodo,
    };
  }, [selectedEvent]);

  // ============================================================================
  // ESTADOS PARA MÓDULO 1: CREACIÓN Y CONFIGURACIÓN MULTISEDE DE EVENTOS
  // ============================================================================
  const [newEvtName, setNewEvtName] = useState('');
  const [newEvtClient, setNewEvtClient] = useState('');
  const [newEvtStart, setNewEvtStart] = useState('2026-11-15');
  const [newEvtEnd, setNewEvtEnd] = useState('2026-11-22');
  const [newEvtResp, setNewEvtResp] = useState('Pepe');

  const [newCityName, setNewCityName] = useState('');
  const [newHotelName, setNewHotelName] = useState('');
  const [selectedCityForHotel, setSelectedCityForHotel] = useState('');

  const [newRubroName, setNewRubroName] = useState('');
  const [newRubroBudget, setNewRubroBudget] = useState('');
  const [newRubroDesc, setNewRubroDesc] = useState('');

  const handleCreateNewEvent = async (e) => {
    e.preventDefault();
    if (!newEvtName.trim()) return;
    const id = 'EVT-' + Date.now().toString().slice(-5);
    const nuevo = {
      id,
      nombre: newEvtName.trim(),
      cliente: newEvtClient.trim() || 'Cliente Deportivo',
      fechaInicio: newEvtStart,
      fechaFin: newEvtEnd,
      responsable: newEvtResp,
      moneda: 'MXN',
      estatus: 'En Planeación Presupuestal',
      sedes: [
        {
          id: 'sede-1',
          ciudad: 'Ciudad Sede Principal',
          hoteles: ['Hotel Sede Oficial'],
        },
      ],
      rubrosPresupuesto: [
        {
          id: 'r-1',
          categoria: 'Hospedaje',
          presupuesto: 500000,
          descripcion: 'Habitaciones sedes',
        },
        {
          id: 'r-2',
          categoria: 'Alimentación',
          presupuesto: 200000,
          descripcion: 'Alimentos atletas y staff',
        },
        {
          id: 'r-3',
          categoria: 'Transporte Terrestre',
          presupuesto: 150000,
          descripcion: 'Traslados locales',
        },
      ],
      gastos: [],
    };
    await syncEventToCloud(nuevo);
    setSelectedEventId(id);
    setNewEvtName('');
    setNewEvtClient('');
    showToast(
      'success',
      'Evento Creado',
      `Se creó "${nuevo.nombre}". Sincronizado en Firebase Cloud.`
    );
  };

  const handleAddCity = async () => {
    if (!newCityName.trim()) return;
    const updated = {
      ...selectedEvent,
      sedes: [
        ...selectedEvent.sedes,
        { id: 'sede-' + Date.now(), ciudad: newCityName.trim(), hoteles: [] },
      ],
    };
    await syncEventToCloud(updated);
    setNewCityName('');
    showToast(
      'success',
      'Ciudad Agregada',
      `Se habilitó la sede ${newCityName} en ${selectedEvent.nombre}.`
    );
  };

  const handleAddHotelToCity = async () => {
    const targetCity = selectedCityForHotel || selectedEvent.sedes[0]?.ciudad;
    if (!targetCity || !newHotelName.trim()) return;
    const updated = {
      ...selectedEvent,
      sedes: selectedEvent.sedes.map((s) =>
        s.ciudad === targetCity
          ? { ...s, hoteles: [...s.hoteles, newHotelName.trim()] }
          : s
      ),
    };
    await syncEventToCloud(updated);
    setNewHotelName('');
    showToast(
      'success',
      'Hotel Registrado',
      `Hotel "${newHotelName}" vinculado a la sede ${targetCity}.`
    );
  };

  const handleAddRubro = async (e) => {
    e.preventDefault();
    const monto = parseFloat(newRubroBudget);
    if (!newRubroName.trim() || isNaN(monto) || monto <= 0) return;

    const existing = selectedEvent.rubrosPresupuesto.find(
      (r) => r.categoria.toLowerCase() === newRubroName.trim().toLowerCase()
    );
    let updatedRubros;
    if (existing) {
      updatedRubros = selectedEvent.rubrosPresupuesto.map((r) =>
        r.id === existing.id
          ? {
              ...r,
              presupuesto: r.presupuesto + monto,
              descripcion: newRubroDesc || r.descripcion,
            }
          : r
      );
    } else {
      updatedRubros = [
        ...selectedEvent.rubrosPresupuesto,
        {
          id: 'rub-' + Date.now(),
          categoria: newRubroName.trim(),
          presupuesto: monto,
          descripcion: newRubroDesc || 'Rubro operativo',
        },
      ];
    }

    await syncEventToCloud({
      ...selectedEvent,
      rubrosPresupuesto: updatedRubros,
    });
    setNewRubroName('');
    setNewRubroBudget('');
    setNewRubroDesc('');
    showToast(
      'success',
      'Presupuesto Actualizado',
      `Rubro "${newRubroName}" actualizado con ${formatCurrency(monto)}.`
    );
  };

  // ============================================================================
  // ESTADOS Y CANDADO ESTRICTO PARA MÓDULO 2: GASTOS Y DOBLE AUTORIZACIÓN
  // ============================================================================
  const [gastoCiudad, setGastoCiudad] = useState('');
  const [gastoHotel, setGastoHotel] = useState('');
  const [gastoCategoria, setGastoCategoria] = useState('');
  const [gastoProveedor, setGastoProveedor] = useState('');
  const [gastoConcepto, setGastoConcepto] = useState('');
  const [gastoMonto, setGastoMonto] = useState('');
  const [gastoFormaPago, setGastoFormaPago] = useState('Transferencia');
  const [gastoCuenta, setGastoCuenta] = useState('MGO Digital');
  const [gastoSolicitante, setGastoSolicitante] = useState('Pepe');

  const activeSedeObj = useMemo(() => {
    const city = gastoCiudad || selectedEvent?.sedes[0]?.ciudad;
    return (
      selectedEvent?.sedes.find((s) => s.ciudad === city) ||
      selectedEvent?.sedes[0]
    );
  }, [selectedEvent, gastoCiudad]);

  const handleRegisterExpense = async (e) => {
    e.preventDefault();
    const montoNum = parseFloat(gastoMonto);
    const cat = gastoCategoria || selectedEvent.rubrosPresupuesto[0]?.categoria;
    if (
      !gastoProveedor.trim() ||
      !gastoConcepto.trim() ||
      isNaN(montoNum) ||
      montoNum <= 0
    ) {
      showToast(
        'error',
        'Datos incompletos',
        'Ingresa proveedor, concepto y un monto válido.'
      );
      return;
    }

    const rubroInfo = financialMetrics.porRubro.find(
      (r) => r.categoria === cat
    );
    const disponibleEnRubro = rubroInfo ? rubroInfo.disponibleRubro : 0;
    const disponibleGlobal = financialMetrics.disponibleParaComprometer;

    // CANDADO ESTRICTO: No permite exceder el presupuesto del rubro ni el global
    if (montoNum > disponibleEnRubro || montoNum > disponibleGlobal) {
      setBlockedModal({
        proveedor: gastoProveedor,
        concepto: gastoConcepto,
        categoria: cat,
        montoIntentado: montoNum,
        disponibleRubro: disponibleEnRubro,
        presupuestoRubro: rubroInfo?.presupuesto || 0,
        exceso: montoNum - disponibleEnRubro,
      });
      return;
    }

    const nuevoGasto = {
      id: 'MGO-' + Math.floor(1000 + Math.random() * 9000),
      fecha: new Date().toISOString().split('T')[0],
      sedeCiudad: activeSedeObj?.ciudad || 'Sede General',
      hotel: gastoHotel || activeSedeObj?.hoteles[0] || 'Sede Oficial',
      categoria: cat,
      proveedor: gastoProveedor.trim(),
      concepto: gastoConcepto.trim(),
      descripcion: `Gasto ligado a ${cat}`,
      monto: montoNum,
      formaPago: gastoFormaPago,
      cuenta: gastoCuenta,
      pagadoPor: currentRole === 'DIR_OPERACIONES' ? 'Manu' : 'Clarisa',
      solicitadoPor: gastoSolicitante,
      comprobante: 'Factura',
      authDirOp: false,
      authDirGen: false,
      firmaPresidente: false,
      selloDigital: null,
      estatus: 'Pendiente 2 Autorizaciones',
    };

    await syncEventToCloud({
      ...selectedEvent,
      gastos: [nuevoGasto, ...selectedEvent.gastos],
    });

    setGastoProveedor('');
    setGastoConcepto('');
    setGastoMonto('');
    showToast(
      'success',
      'Solicitud Registrada',
      'El gasto pasó el candado presupuestal y espera autorización de Dir. Operaciones y Dir. General.'
    );
  };

  const handleToggleAuth = async (gastoId, type) => {
    const updatedGastos = selectedEvent.gastos.map((g) => {
      if (g.id !== gastoId) return g;
      if (type === 'DIR_OP') {
        if (currentRole !== 'DIR_OPERACIONES') {
          showToast(
            'error',
            'Rol requerido: Director de Operaciones',
            'Cambia al rol "Dir. Operaciones (Manu)" arriba a la derecha para autorizar.'
          );
          return g;
        }
        const nextVal = !g.authDirOp;
        return {
          ...g,
          authDirOp: nextVal,
          estatus:
            nextVal && g.authDirGen
              ? 'Listo para Firma Presidente'
              : 'Pendiente Autorización',
        };
      }
      if (type === 'DIR_GEN') {
        if (currentRole !== 'DIR_GENERAL') {
          showToast(
            'error',
            'Rol requerido: Dirección General',
            'Cambia al rol "Dirección General (Clarisa)" arriba a la derecha para autorizar.'
          );
          return g;
        }
        const nextVal = !g.authDirGen;
        return {
          ...g,
          authDirGen: nextVal,
          estatus:
            g.authDirOp && nextVal
              ? 'Listo para Firma Presidente'
              : 'Pendiente Autorización',
        };
      }
      if (type === 'PRESIDENTE') {
        if (currentRole !== 'PRESIDENTE') {
          showToast(
            'error',
            'Exclusivo del Presidente',
            'Solo el rol Presidente puede estampar la Firma Digital liberadora.'
          );
          return g;
        }
        if (!g.authDirOp || !g.authDirGen) {
          showToast(
            'error',
            'Firma Bloqueada por Regla MGO',
            'El Presidente no puede firmar pagos sin las 2 autorizaciones previas (Operaciones y Dirección General).'
          );
          return g;
        }
        const sello =
          'MGO-SIG-' + Math.floor(100000 + Math.random() * 900000) + '-PRES';
        showToast(
          'success',
          'Firma Digital Estampada',
          `Pago liberado con sello ${sello}.`
        );
        return {
          ...g,
          firmaPresidente: true,
          selloDigital: sello,
          estatus: 'Pagado',
        };
      }
      return g;
    });

    await syncEventToCloud({ ...selectedEvent, gastos: updatedGastos });
  };

  // ============================================================================
  // EXPORTAR ACTA DE CIERRE A EXCEL (CSV)
  // ============================================================================
  const handleExportExcel = () => {
    if (!selectedEvent || !financialMetrics) return;
    const rows = [
      ['ACTA DE CIERRE FINANCIERO Y CUADRE PRESUPUESTAL - MGO EVENTS'],
      ['Evento:', selectedEvent.nombre, 'Cliente:', selectedEvent.cliente],
      [
        'Fecha Inicio:',
        selectedEvent.fechaInicio,
        'Fecha Termino:',
        selectedEvent.fechaFin,
      ],
      [
        'Presupuesto Total:',
        financialMetrics.presupuestoTotal,
        'Total Pagado (Firmado):',
        financialMetrics.totalPagado,
      ],
      ['Ahorro / Desviacion vs Pagado:', financialMetrics.ahorroSoloPagado],
      [],
      [
        'ID',
        'Fecha',
        'Ciudad Sede',
        'Hotel',
        'Rubro / Categoria',
        'Proveedor',
        'Concepto',
        'Monto MXN',
        'Forma de Pago',
        'Cuenta / Tarjeta',
        'Auth Dir Operaciones',
        'Auth Dir General',
        'Firma Digital Presidente',
        'Sello Digital',
      ],
    ];
    selectedEvent.gastos.forEach((g) => {
      rows.push([
        g.id,
        g.fecha,
        g.sedeCiudad,
        g.hotel,
        g.categoria,
        g.proveedor,
        g.concepto,
        g.monto,
        g.formaPago,
        g.cuenta,
        g.authDirOp ? 'AUTORIZADO' : 'PENDIENTE',
        g.authDirGen ? 'AUTORIZADO' : 'PENDIENTE',
        g.firmaPresidente ? 'FIRMADO Y PAGADO' : 'SIN FIRMA',
        g.selloDigital || 'N/A',
      ]);
    });
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      rows.map((e) => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute(
      'download',
      `Cierre_${selectedEvent.nombre.replace(/\s+/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* NOTIFICACIÓN FLOTANTE */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 max-w-md p-4 rounded-xl shadow-2xl border flex items-start gap-3 ${
            notification.type === 'error'
              ? 'bg-red-950 text-white border-red-700'
              : 'bg-slate-900 text-white border-teal-500'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-6 h-6 text-teal-400 shrink-0" />
          )}
          <div>
            <h4 className="font-bold text-sm">{notification.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              {notification.message}
            </p>
          </div>
        </div>
      )}

      {/* MODAL DE BLOQUEO ESTRICTO DE PRESUPUESTO */}
      {blockedModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border-2 border-red-600">
            <div className="bg-gradient-to-r from-[#9B1B60] via-[#EE2743] to-[#F37338] p-5 text-white flex items-center gap-3">
              <ShieldAlert className="w-10 h-10 shrink-0" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded">
                  Candado Presupuestal MGO Activo
                </span>
                <h3 className="text-xl font-black mt-1">
                  PAGO RECHAZADO POR EXCEDER PRESUPUESTO
                </h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                El sistema de <strong>MGO Events</strong> bloqueó
                automáticamente esta solicitud hacia{' '}
                <strong>{blockedModal.proveedor}</strong> porque supera el saldo
                disponible en el rubro <strong>{blockedModal.categoria}</strong>
                .
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    Presupuesto del Rubro ({blockedModal.categoria}):
                  </span>
                  <span className="font-bold">
                    {formatCurrency(blockedModal.presupuestoRubro)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    Saldo Disponible en el Rubro:
                  </span>
                  <span className="font-bold text-emerald-700">
                    {formatCurrency(blockedModal.disponibleRubro)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-red-200 pt-2">
                  <span className="text-red-700 font-bold">
                    Monto que se intentó registrar:
                  </span>
                  <span className="font-black text-red-700">
                    {formatCurrency(blockedModal.montoIntentado)}
                  </span>
                </div>
                <div className="flex justify-between text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold">
                  <span>Excedente No Autorizado:</span>
                  <span>+ {formatCurrency(blockedModal.exceso)}</span>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setBlockedModal(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm"
                >
                  Entendido, Ajustar Monto o Ampliar Presupuesto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BARRA SUPERIOR DE ESTADO Y SIMULADOR DE ROLES PARA FIRMAS */}
      <div className="bg-[#0D4F8B] text-white text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
              <Cloud className="w-3.5 h-3.5" />
              {cloudStatus === 'synced'
                ? 'Conectado a Firebase Cloud (mgo-events-sistema)'
                : 'Sincronización Cloud Activa'}
            </span>
            <span className="hidden md:inline text-white/70">
              | Candado Estricto + Doble Autorización + Firma Digital Presidente
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white/80 font-semibold">
              Actuar como usuario:
            </span>
            {[
              { id: 'SOLICITANTE', label: 'Solicitante (Pepe)' },
              {
                id: 'DIR_OPERACIONES',
                label: '1ra Firma: Dir. Operaciones (Manu)',
              },
              { id: 'DIR_GENERAL', label: '2da Firma: Dir. General (Clarisa)' },
              { id: 'PRESIDENTE', label: 'Firma Digital: Presidente' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setCurrentRole(r.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  currentRole === r.id
                    ? 'bg-[#F5D34B] text-slate-950 shadow-sm'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* HEADER CORPORATIVO CON LOGOTIPO OFICIAL MGO Y SELECTOR DE EVENTO */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0D4F8B] via-[#118A96] via-[#9B1B60] via-[#EE2743] via-[#F37338] to-[#F5D34B]" />
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <MGOLogo />

          {/* SELECTOR DE EVENTO ACTIVO */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#118A96]" />
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-500">
                  Evento Activo en Pantalla
                </div>
                <select
                  value={selectedEvent.id}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="bg-transparent font-black text-sm text-[#0D4F8B] focus:outline-none cursor-pointer pr-2"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.nombre} ({ev.sedes.length}{' '}
                      {ev.sedes.length === 1 ? 'ciudad' : 'ciudades'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleExportExcel}
              className="bg-[#118A96] hover:bg-[#0e747e] text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              Descargar Cierre (Excel)
            </button>
          </div>
        </div>

        {/* NAVEGACIÓN PRINCIPAL EN LAS 3 GRANDES CATEGORÍAS + ADMINISTRACIÓN DE USUARIOS */}
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto border-t border-slate-100">
          {[
            {
              id: 'CREACION_EVENTO',
              num: '1',
              title: 'Creación de Evento',
              sub: 'Sedes, Hoteles y Rubros de Presupuesto',
              icon: Layers,
              color: '#118A96',
            },
            {
              id: 'GASTOS_AUTORIZACION',
              num: '2',
              title: 'Gastos y Autorizaciones',
              sub: 'Registro vs Presupuesto, TDC/SPEI y 3 Firmas',
              icon: CreditCard,
              color: '#9B1B60',
            },
            {
              id: 'CONSULTA_PRESIDENTE',
              num: '3',
              title: 'Consulta y Cierre (Presidente)',
              sub: 'Presupuesto vs Real en Tiempo Real y Ahorros',
              icon: BarChart3,
              color: '#0D4F8B',
            },
            {
              id: 'USUARIOS_ROLES',
              num: '4',
              title: 'Usuarios y Roles',
              sub: 'Niveles de Autorización y Tarjetas',
              icon: Users,
              color: '#F37338',
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeModule === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveModule(tab.id)}
                className={`flex items-center gap-3 px-5 py-3.5 border-b-4 transition-all shrink-0 text-left ${
                  active
                    ? 'border-[#0D4F8B] bg-slate-50/90'
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
                  <div
                    className={`text-sm font-black flex items-center gap-1.5 ${
                      active ? 'text-slate-900' : 'text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.title}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {tab.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        {/* RESUMEN RÁPIDO DEL EVENTO SELECCIONADO */}
        <div className="bg-gradient-to-r from-[#0D4F8B] via-[#118A96] to-[#0D4F8B] rounded-2xl p-5 text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F5D34B]">
              <span>{selectedEvent.estatus}</span>
              <span>•</span>
              <span>Responsable: {selectedEvent.responsable}</span>
              <span>•</span>
              <span>
                {selectedEvent.fechaInicio} al {selectedEvent.fechaFin}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black mt-1">
              {selectedEvent.nombre}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {selectedEvent.sedes.map((s) => (
                <span
                  key={s.id}
                  className="bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#F5D34B]" />
                  {s.ciudad}:{' '}
                  <strong className="text-[#F5D34B]">
                    {s.hoteles.join(', ') || 'Sin hoteles'}
                  </strong>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/15">
              <div className="text-[10px] uppercase text-white/75 font-bold">
                Presupuesto Autorizado
              </div>
              <div className="text-lg font-black mt-0.5">
                {formatCurrency(financialMetrics.presupuestoTotal)}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/15">
              <div className="text-[10px] uppercase text-white/75 font-bold">
                Gasto Real (Firmado)
              </div>
              <div className="text-lg font-black text-[#F5D34B] mt-0.5">
                {formatCurrency(financialMetrics.totalPagado)}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/15">
              <div className="text-[10px] uppercase text-white/75 font-bold">
                En Trámite de Firma
              </div>
              <div className="text-lg font-black text-orange-200 mt-0.5">
                {formatCurrency(financialMetrics.totalEnAutorizacion)}
              </div>
            </div>
            <div className="bg-emerald-950/60 backdrop-blur-sm p-3 rounded-xl border border-emerald-400/40">
              <div className="text-[10px] uppercase text-emerald-300 font-bold">
                Ahorro / Disponible Real
              </div>
              <div className="text-lg font-black text-emerald-300 mt-0.5">
                {formatCurrency(financialMetrics.ahorroSoloPagado)}
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            MÓDULO 1: CREACIÓN DE EVENTO (SEDES, HOTELES Y RUBROS PRESUPUESTALES)
        ===================================================================== */}
        {activeModule === 'CREACION_EVENTO' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 1A: DAR DE ALTA UN NUEVO EVENTO */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-2 text-[#0D4F8B] font-black text-base mb-1">
                  <PlusCircle className="w-5 h-5" />
                  1A. Dar de Alta Nuevo Evento Deportivo
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Crea un evento desde cero para asignarle sus ciudades sede,
                  hoteles y presupuesto por rubro.
                </p>
                <form
                  onSubmit={handleCreateNewEvent}
                  className="space-y-3 text-sm"
                >
                  <div>
                    <label className="text-xs font-bold text-slate-600">
                      Nombre del Evento *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Campeonato Panamericano Boxeo 2026"
                      value={newEvtName}
                      onChange={(e) => setNewEvtName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#118A96]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">
                      Cliente / Federación
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. CONADE / Comité Olímpico"
                      value={newEvtClient}
                      onChange={(e) => setNewEvtClient(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-600">
                        Fecha Inicio
                      </label>
                      <input
                        type="date"
                        value={newEvtStart}
                        onChange={(e) => setNewEvtStart(e.target.value)}
                        className="w-full mt-1 px-2.5 py-2 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600">
                        Fecha Fin
                      </label>
                      <input
                        type="date"
                        value={newEvtEnd}
                        onChange={(e) => setNewEvtEnd(e.target.value)}
                        className="w-full mt-1 px-2.5 py-2 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">
                      Responsable Operativo MGO
                    </label>
                    <select
                      value={newEvtResp}
                      onChange={(e) => setNewEvtResp(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl bg-white"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.nombre}>
                          {u.nombre} ({u.cargo})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#0D4F8B] hover:bg-[#093b69] text-white font-bold py-2.5 rounded-xl shadow-sm transition"
                  >
                    Crear Evento y Configurar Sedes
                  </button>
                </form>
              </div>

              {/* 1B: CIUDADES SEDE Y MÚLTIPLES HOTELES POR CIUDAD */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-2 text-[#118A96] font-black text-base mb-1">
                  <Hotel className="w-5 h-5" />
                  1B. Sedes (Ciudades) y Hoteles del Evento
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Un evento como la Olimpiada Nacional puede tener múltiples
                  ciudades y varios hoteles por ciudad.
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nueva ciudad (Ej. Puebla, Pue.)"
                      value={newCityName}
                      onChange={(e) => setNewCityName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCity}
                      className="bg-[#118A96] text-white font-bold px-3 py-2 rounded-xl text-xs shrink-0"
                    >
                      + Ciudad
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="text-[11px] font-bold text-slate-600">
                      Agregar Hotel a una Ciudad Sede:
                    </div>
                    <select
                      value={
                        selectedCityForHotel ||
                        selectedEvent.sedes[0]?.ciudad ||
                        ''
                      }
                      onChange={(e) => setSelectedCityForHotel(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-semibold"
                    >
                      {selectedEvent.sedes.map((s) => (
                        <option key={s.id} value={s.ciudad}>
                          {s.ciudad}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nombre del Hotel (Ej. Quinta Real)"
                        value={newHotelName}
                        onChange={(e) => setNewHotelName(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddHotelToCity}
                        className="bg-[#9B1B60] text-white font-bold px-3 py-1.5 rounded-lg text-xs shrink-0"
                      >
                        + Hotel
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {selectedEvent.sedes.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70"
                    >
                      <div className="font-black text-xs text-[#0D4F8B] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#EE2743]" />
                        {s.ciudad}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {s.hoteles.map((h, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[11px] font-medium text-slate-700 flex items-center gap-1"
                          >
                            <Building2 className="w-3 h-3 text-[#118A96]" />
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1C: AGREGAR RUBROS Y CATEGORÍAS DE PRESUPUESTO */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-2 text-[#9B1B60] font-black text-base mb-1">
                  <DollarSign className="w-5 h-5" />
                  1C. Agregar / Ampliar Rubro Presupuestal
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Selecciona un rubro sugerido (Hospedaje, Perdiem, Fee, Vuelos
                  Jueces...) o escribe cualquier categoría nueva.
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {RUBROS_SUGERIDOS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setNewRubroName(sug)}
                      className="text-[10px] font-semibold px-2 py-1 rounded-md bg-slate-100 hover:bg-[#118A96] hover:text-white text-slate-700 transition"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleAddRubro} className="space-y-3 text-sm">
                  <div>
                    <label className="text-xs font-bold text-slate-600">
                      Nombre del Rubro / Categoría *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Vuelos de Jueces / Perdiem / Fee del Evento"
                      value={newRubroName}
                      onChange={(e) => setNewRubroName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">
                      Monto Presupuestado Autorizado (MXN) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ej. 150000"
                      value={newRubroBudget}
                      onChange={(e) => setNewRubroBudget(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">
                      Alcance / Concepto del Rubro
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Boletos aéreos para 25 jueces internacionales"
                      value={newRubroDesc}
                      onChange={(e) => setNewRubroDesc(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#9B1B60] hover:bg-[#7d154d] text-white font-bold py-2.5 rounded-xl shadow-sm transition"
                  >
                    Guardar Rubro en el Presupuesto
                  </button>
                </form>
              </div>
            </div>

            {/* TABLA DE PRESUPUESTO MAESTRO DEL EVENTO */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="font-black text-slate-900">
                    Presupuesto Maestro por Rubro — {selectedEvent.nombre}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ningún pago en el Módulo 2 podrá superar el techo asignado a
                    cada rubro.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-semibold">
                    Techo Presupuestal Total:
                  </span>
                  <div className="text-xl font-black text-[#0D4F8B]">
                    {formatCurrency(financialMetrics.presupuestoTotal)}
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-slate-600 text-xs uppercase">
                    <tr>
                      <th className="py-3 px-4 text-left">Rubro / Categoría</th>
                      <th className="py-3 px-4 text-left">
                        Descripción Operativa
                      </th>
                      <th className="py-3 px-4 text-right">
                        Presupuesto Asignado
                      </th>
                      <th className="py-3 px-4 text-right">
                        Ejercido (Firmado)
                      </th>
                      <th className="py-3 px-4 text-right">Saldo Disponible</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {financialMetrics.porRubro.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {r.categoria}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">
                          {r.descripcion}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-[#0D4F8B]">
                          {formatCurrency(r.presupuesto)}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-700">
                          {formatCurrency(r.pagadoRubro)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700">
                          {formatCurrency(r.disponibleRubro)}
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
            MÓDULO 2: GASTOS Y AUTORIZACIONES (CANDADO + 2 FIRMAS + PRESIDENTE)
        ===================================================================== */}
        {activeModule === 'GASTOS_AUTORIZACION' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* FORMULARIO DE REGISTRO DE GASTO CON CANDADO */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-[#9B1B60] font-black text-base">
                    <CreditCard className="w-5 h-5" />
                    Solicitar Pago / Registrar Gasto
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setBlockedModal({
                        proveedor: 'Proveedor Demo Excedente S.A.',
                        concepto: 'Cargo extra no presupuestado',
                        categoria: 'Hospedaje',
                        montoIntentado: 250000,
                        disponibleRubro: 32743.56,
                        presupuestoRubro: 560000,
                        exceso: 217256.44,
                      })
                    }
                    className="text-[11px] bg-red-100 hover:bg-red-200 text-red-700 font-bold px-2.5 py-1 rounded-lg"
                  >
                    Simular Exceso
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Todo pago se valida en tiempo real contra el saldo del rubro
                  antes de pasar a las 2 firmas de autorización.
                </p>

                <form
                  onSubmit={handleRegisterExpense}
                  className="space-y-3 text-sm"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-600">
                        Ciudad Sede
                      </label>
                      <select
                        value={
                          gastoCiudad || selectedEvent.sedes[0]?.ciudad || ''
                        }
                        onChange={(e) => {
                          setGastoCiudad(e.target.value);
                          setGastoHotel('');
                        }}
                        className="w-full mt-1 px-2.5 py-2 border border-slate-300 rounded-xl text-xs bg-white font-semibold"
                      >
                        {selectedEvent.sedes.map((s) => (
                          <option key={s.id} value={s.ciudad}>
                            {s.ciudad}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600">
                        Hotel Sede
                      </label>
                      <select
                        value={gastoHotel || activeSedeObj?.hoteles[0] || ''}
                        onChange={(e) => setGastoHotel(e.target.value)}
                        className="w-full mt-1 px-2.5 py-2 border border-slate-300 rounded-xl text-xs bg-white font-semibold"
                      >
                        {(activeSedeObj?.hoteles || ['Hotel General']).map(
                          (h, i) => (
                            <option key={i} value={h}>
                              {h}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600">
                      Rubro del Presupuesto *
                    </label>
                    <select
                      value={
                        gastoCategoria ||
                        selectedEvent.rubrosPresupuesto[0]?.categoria ||
                        ''
                      }
                      onChange={(e) => setGastoCategoria(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-[#0D4F8B]"
                    >
                      {financialMetrics.porRubro.map((r) => (
                        <option key={r.id} value={r.categoria}>
                          {r.categoria} (Disp:{' '}
                          {formatCurrency(r.disponibleRubro)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600">
                      Proveedor o Beneficiario *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Aeroméxico / Hotel Holiday Inn / Alamo"
                      value={gastoProveedor}
                      onChange={(e) => setGastoProveedor(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600">
                      Concepto del Pago *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Liquidación 15 vuelos jueces / Hospedaje"
                      value={gastoConcepto}
                      onChange={(e) => setGastoConcepto(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-xl"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-600">
                        Monto Total (MXN) *
                      </label>
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
                      <label className="text-xs font-bold text-slate-600">
                        Método de Pago
                      </label>
                      <select
                        value={gastoFormaPago}
                        onChange={(e) => {
                          setGastoFormaPago(e.target.value);
                          if (e.target.value === 'Transferencia')
                            setGastoCuenta('MGO Digital');
                          if (e.target.value === 'Tarjeta Corporativa')
                            setGastoCuenta('Clari Amex');
                          if (e.target.value === 'Efectivo / Reembolso')
                            setGastoCuenta('Cash');
                        }}
                        className="w-full mt-1 px-2.5 py-2 border border-slate-300 rounded-xl text-xs bg-white font-bold"
                      >
                        <option value="Transferencia">
                          Transferencia SPEI
                        </option>
                        <option value="Tarjeta Corporativa">
                          Tarjeta de Crédito Corp.
                        </option>
                        <option value="Efectivo / Reembolso">
                          Efectivo / Reembolso
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-600">
                        Cuenta / Tarjeta Salida
                      </label>
                      <select
                        value={gastoCuenta}
                        onChange={(e) => setGastoCuenta(e.target.value)}
                        className="w-full mt-1 px-2.5 py-2 border border-slate-300 rounded-xl text-xs bg-white font-semibold"
                      >
                        {CUENTAS_CORPORATIVAS.map((c) => (
                          <option key={c.nombre} value={c.nombre}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600">
                        Solicitado por
                      </label>
                      <select
                        value={gastoSolicitante}
                        onChange={(e) => setGastoSolicitante(e.target.value)}
                        className="w-full mt-1 px-2.5 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                      >
                        {users.map((u) => (
                          <option key={u.id} value={u.nombre}>
                            {u.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#9B1B60] to-[#EE2743] hover:opacity-95 text-white font-black py-3 rounded-xl shadow-md transition"
                  >
                    Validar contra Presupuesto y Enviar a Firmas
                  </button>
                </form>
              </div>

              {/* BANDEJA DE DOBLE AUTORIZACIÓN Y FIRMA DIGITAL DEL PRESIDENTE */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-black text-base flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#F5D34B]" />
                      Flujo de Doble Autorización y Firma Digital del Presidente
                    </h3>
                    <p className="text-xs text-slate-300">
                      Regla MGO: El Presidente NO puede estampar su firma
                      digital si faltan las firmas de Dir. Operaciones (Manu) y
                      Dirección General (Clarisa).
                    </p>
                  </div>
                  <span className="text-xs bg-white/10 px-3 py-1 rounded-lg font-bold text-[#F5D34B]">
                    Rol Activo: {currentRole}
                  </span>
                </div>

                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase">
                      <tr>
                        <th className="py-3 px-3 text-left">
                          Folio / Sede / Hotel
                        </th>
                        <th className="py-3 px-3 text-left">
                          Rubro / Proveedor / Concepto
                        </th>
                        <th className="py-3 px-3 text-left">Método / Cuenta</th>
                        <th className="py-3 px-3 text-right">Monto</th>
                        <th className="py-3 px-3 text-center">
                          1. Dir. Op (Manu)
                        </th>
                        <th className="py-3 px-3 text-center">
                          2. Dir. Gral (Clarisa)
                        </th>
                        <th className="py-3 px-3 text-center">
                          3. Firma Presidente
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedEvent.gastos.map((g) => {
                        const listasLasDosFirmas = g.authDirOp && g.authDirGen;
                        return (
                          <tr
                            key={g.id}
                            className={
                              g.firmaPresidente ? 'bg-white' : 'bg-amber-50/40'
                            }
                          >
                            <td className="py-3 px-3">
                              <div className="font-black text-slate-900">
                                {g.id}
                              </div>
                              <div className="text-[11px] font-semibold text-[#118A96]">
                                {g.sedeCiudad}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {g.hotel}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-[#0D4F8B] font-bold text-[10px] mb-1">
                                {g.categoria}
                              </span>
                              <div className="font-bold text-slate-900">
                                {g.proveedor}
                              </div>
                              <div className="text-slate-500">{g.concepto}</div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-800">
                                {g.formaPago}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Cuenta: {g.cuenta}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right font-black text-sm text-slate-900">
                              {formatCurrency(g.monto)}
                            </td>

                            {/* BOTÓN 1: DIRECTOR DE OPERACIONES */}
                            <td className="py-3 px-3 text-center">
                              <button
                                disabled={g.firmaPresidente}
                                onClick={() => handleToggleAuth(g.id, 'DIR_OP')}
                                className={`px-2.5 py-1.5 rounded-lg font-bold inline-flex items-center gap-1 transition ${
                                  g.authDirOp
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                }`}
                              >
                                {g.authDirOp ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  <ClockIcon />
                                )}
                                {g.authDirOp ? 'Autorizado' : 'Autorizar'}
                              </button>
                            </td>

                            {/* BOTÓN 2: DIRECCIÓN GENERAL */}
                            <td className="py-3 px-3 text-center">
                              <button
                                disabled={g.firmaPresidente}
                                onClick={() =>
                                  handleToggleAuth(g.id, 'DIR_GEN')
                                }
                                className={`px-2.5 py-1.5 rounded-lg font-bold inline-flex items-center gap-1 transition ${
                                  g.authDirGen
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                }`}
                              >
                                {g.authDirGen ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  <ClockIcon />
                                )}
                                {g.authDirGen ? 'Autorizado' : 'Autorizar'}
                              </button>
                            </td>

                            {/* BOTÓN 3: FIRMA DIGITAL DEL PRESIDENTE */}
                            <td className="py-3 px-3 text-center">
                              {g.firmaPresidente ? (
                                <div className="inline-flex flex-col items-center bg-[#0D4F8B]/10 border border-[#0D4F8B]/30 px-2.5 py-1 rounded-lg">
                                  <span className="text-[10px] font-black text-[#0D4F8B] flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5" />{' '}
                                    FIRMADO Y PAGADO
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-500">
                                    {g.selloDigital}
                                  </span>
                                </div>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleToggleAuth(g.id, 'PRESIDENTE')
                                  }
                                  className={`px-3 py-1.5 rounded-lg font-black inline-flex items-center gap-1.5 transition ${
                                    listasLasDosFirmas
                                      ? 'bg-gradient-to-r from-[#0D4F8B] to-[#118A96] text-white shadow hover:opacity-95'
                                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  }`}
                                >
                                  {listasLasDosFirmas ? (
                                    <KeyRound className="w-3.5 h-3.5 text-[#F5D34B]" />
                                  ) : (
                                    <Lock className="w-3.5 h-3.5" />
                                  )}
                                  {listasLasDosFirmas
                                    ? 'Firmar Pago (Presidente)'
                                    : 'Bloqueado (Faltan Firmas)'}
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
            MÓDULO 3: CONSULTA EJECUTIVA Y CIERRE DE EVENTO (VISTA PRESIDENTE)
        ===================================================================== */}
        {activeModule === 'CONSULTA_PRESIDENTE' && (
          <div className="space-y-6">
            {/* TARJETAS DE CONCILIACIÓN BANCARIA: TRANSFERENCIAS VS TARJETAS CORPORATIVAS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">
                    Pagado por Transferencia SPEI
                  </span>
                  <div className="text-2xl font-black text-[#0D4F8B] mt-1">
                    {formatCurrency(financialMetrics.porMetodo.Transferencia)}
                  </div>
                  <span className="text-xs text-slate-500">
                    Cuenta Eje: MGO Digital
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#0D4F8B]/10 text-[#0D4F8B] flex items-center justify-center">
                  <Landmark className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">
                    Tarjetas de Crédito Corporativas
                  </span>
                  <div className="text-2xl font-black text-[#9B1B60] mt-1">
                    {formatCurrency(financialMetrics.porMetodo.Tarjeta)}
                  </div>
                  <span className="text-xs text-slate-500">
                    Clari Amex, Manu 1251, BOFA 9273, Amex 4002
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#9B1B60]/10 text-[#9B1B60] flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">
                    Efectivo / Caja Chica / Reembolsos
                  </span>
                  <div className="text-2xl font-black text-[#118A96] mt-1">
                    {formatCurrency(financialMetrics.porMetodo.Efectivo)}
                  </div>
                  <span className="text-xs text-slate-500">
                    Casetas, gasolina y papelería urgente
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#118A96]/10 text-[#118A96] flex items-center justify-center">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* TABLA DE CUADRE DE CIERRE: PRESUPUESTO VS GASTO REAL Y AHORROS POR RUBRO */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#118A96]">
                    Vista Ejecutiva de Presidencia en Tiempo Real
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    Cuadre de Cierre por Rubro: Presupuesto vs. Gasto Real —{' '}
                    {selectedEvent.nombre}
                  </h3>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-right">
                  <div className="text-[11px] font-bold text-emerald-700 uppercase">
                    Ahorro Neto Logrado al Cierre
                  </div>
                  <div className="text-xl font-black text-emerald-700">
                    {formatCurrency(financialMetrics.ahorroSoloPagado)} (
                    {(
                      (financialMetrics.ahorroSoloPagado /
                        financialMetrics.presupuestoTotal) *
                      100
                    ).toFixed(2)}
                    %)
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900 text-white text-xs uppercase">
                    <tr>
                      <th className="py-3.5 px-4 text-left">
                        Rubro / Categoría
                      </th>
                      <th className="py-3.5 px-4 text-right">
                        Presupuesto Autorizado
                      </th>
                      <th className="py-3.5 px-4 text-right">
                        Gasto Real Pagado
                      </th>
                      <th className="py-3.5 px-4 text-right">
                        En Trámite de Firma
                      </th>
                      <th className="py-3.5 px-4 text-right">
                        Ahorro / Desviación
                      </th>
                      <th className="py-3.5 px-4 text-center">% Ejercido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {financialMetrics.porRubro.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4">
                          <div className="font-black text-slate-900">
                            {r.categoria}
                          </div>
                          <div className="text-xs text-slate-500">
                            {r.descripcion}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                          {formatCurrency(r.presupuesto)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-[#0D4F8B]">
                          {formatCurrency(r.pagadoRubro)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-amber-600">
                          {formatCurrency(r.tramiteRubro)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-black text-xs">
                            <TrendingDown className="w-3.5 h-3.5" />
                            Ahorro: {formatCurrency(r.ahorroRubro)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 w-44">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#0D4F8B] to-[#118A96]"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    r.porcentajeEjercido
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-700 w-12 text-right">
                              {r.porcentajeEjercido.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                    <tr>
                      <td className="py-4 px-4">TOTALES DEL EVENTO</td>
                      <td className="py-4 px-4 text-right text-[#0D4F8B]">
                        {formatCurrency(financialMetrics.presupuestoTotal)}
                      </td>
                      <td className="py-4 px-4 text-right text-[#0D4F8B]">
                        {formatCurrency(financialMetrics.totalPagado)}
                      </td>
                      <td className="py-4 px-4 text-right text-amber-700">
                        {formatCurrency(financialMetrics.totalEnAutorizacion)}
                      </td>
                      <td className="py-4 px-4 text-right text-emerald-700">
                        {formatCurrency(financialMetrics.ahorroSoloPagado)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {(
                          (financialMetrics.totalPagado /
                            financialMetrics.presupuestoTotal) *
                          100
                        ).toFixed(2)}
                        %
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            MÓDULO 4: PANEL DE ADMINISTRACIÓN DE USUARIOS Y ROLES
        ===================================================================== */}
        {activeModule === 'USUARIOS_ROLES' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-2 text-[#F37338] font-black text-base mb-1">
                <UserPlus className="w-5 h-5" />
                Dar de Alta Usuario y Rol de Autorización
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Define quién puede capturar gastos, quién autoriza en 1ra y 2da
                instancia y quién posee la Firma Digital.
              </p>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <strong>Matriz de Niveles MGO:</strong>
                <div>
                  • <strong>Solicitante:</strong> Captura solicitudes vs
                  presupuesto.
                </div>
                <div>
                  • <strong>Dir. de Operaciones:</strong> 1ra firma obligatoria.
                </div>
                <div>
                  • <strong>Dirección General:</strong> 2da firma obligatoria.
                </div>
                <div>
                  • <strong>Presidente:</strong> Firma digital liberadora final.
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-black text-slate-900">
                  Directorio de Usuarios y Matriz de Autorizaciones MGO
                </h3>
                <p className="text-xs text-slate-500">
                  Usuarios activos y sus facultades dentro del flujo de pagos.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                    <tr>
                      <th className="py-3 px-4 text-left">Usuario / Correo</th>
                      <th className="py-3 px-4 text-left">Cargo</th>
                      <th className="py-3 px-4 text-left">
                        Nivel de Autorización en Sistema
                      </th>
                      <th className="py-3 px-4 text-left">
                        Medios de Pago Asignados
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="font-black text-slate-900">
                            {u.nombre}
                          </div>
                          <div className="text-xs text-slate-500">
                            {u.email}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-slate-700">
                          {u.cargo}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-[#0D4F8B]/10 text-[#0D4F8B]">
                            {u.nivelAutorizacion}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-slate-600">
                          {u.tarjetaAsignada}
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

function ClockIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
