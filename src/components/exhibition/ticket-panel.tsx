'use client'

import { useCartStore } from '@/stores/cart-store'
import { ShoppingCart } from 'lucide-react'

interface TicketPanelProps {
  tickets: {
    id: string
    type: 'single' | 'season'
    price: number
    max_qty: number
    sold_qty: number
    perks_json: Record<string, unknown> | null
  }[]
  exhibitionTitle: string
}

export function TicketPanel({ tickets, exhibitionTitle }: TicketPanelProps) {
  const { addItem } = useCartStore()

  return (
    <div className="border-t border-border bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-8 text-center text-2xl font-bold">Билеты</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {tickets.map((ticket) => {
            const isSeason = ticket.type === 'season'
            const label = isSeason ? 'Сезонный билет' : 'Разовый билет'
            const perks = ticket.perks_json
              ? Object.entries(ticket.perks_json)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(', ')
              : ''

            return (
              <div
                key={ticket.id}
                className="card flex flex-col justify-between p-6"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{label}</h3>
                    {isSeason && (
                      <span className="badge bg-accent/20 text-accent">
                        Популярно
                      </span>
                    )}
                  </div>
                  <div className="mb-4 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      {ticket.price.toLocaleString('ru-RU')}
                    </span>
                    <span className="text-sm text-muted-foreground">₽</span>
                  </div>
                  {perks && (
                    <p className="mb-4 text-sm text-muted-foreground">
                      {perks}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Осталось: {ticket.max_qty - ticket.sold_qty} из{' '}
                    {ticket.max_qty}
                  </p>
                </div>
                <button
                  onClick={() =>
                    addItem({
                      id: `ticket-${ticket.id}`,
                      type: 'ticket',
                      refId: ticket.id,
                      title: `${label} — ${exhibitionTitle}`,
                      price: ticket.price,
                      qty: 1,
                    })
                  }
                  className="btn-primary mt-4 gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  В корзину
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
