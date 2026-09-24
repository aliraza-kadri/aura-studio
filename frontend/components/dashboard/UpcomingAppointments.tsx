import React from 'react'
import { Calendar, Clock, MapPin, Tag } from 'lucide-react'
import type { Appointment, Customer } from '@/types/database'
import { EmptyState } from './EmptyState'

interface AppointmentWithCustomer extends Appointment {
  customer?: Customer | null
}

interface UpcomingAppointmentsProps {
  appointments: AppointmentWithCustomer[]
  isLoading?: boolean
}

export const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({
  appointments,
  isLoading = false,
}) => {
  return (
    <div className="rounded-xl bg-[#0F1420]/80 border border-slate-800/80 p-5 sm:p-6 flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Upcoming Appointments
            </h3>
            <p className="text-[11px] text-slate-400">Bespoke fittings & styling sessions</p>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {appointments.length} scheduled
        </span>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-lg bg-slate-800/40 animate-pulse border border-slate-800/40"
              />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No upcoming appointments"
            description="Private showroom appointments and custom measurement fittings will appear here."
          />
        ) : (
          <div className="divide-y divide-slate-850">
            {appointments.map((appt) => {
              const dateObj = new Date(appt.appointment_date)
              const formattedDate = isNaN(dateObj.getTime())
                ? appt.appointment_date
                : dateObj.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
              const formattedTime = isNaN(dateObj.getTime())
                ? ''
                : dateObj.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })

              return (
                <div
                  key={appt.id}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-850/40 px-2 rounded-lg transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-xs font-medium text-slate-200">
                        {appt.customer?.name || (appt.customer_id ? `Client #${appt.customer_id.slice(0, 8)}` : 'Client')}
                      </p>
                      {appt.notes && (
                        <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                          • {appt.notes}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formattedDate} {formattedTime ? `at ${formattedTime}` : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        AURA Showroom
                      </span>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                        appt.status === 'confirmed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : appt.status === 'cancelled'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {appt.status || 'scheduled'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
