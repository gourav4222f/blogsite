import { SettingsForm } from '@/components/app/SettingsForm'
import React from 'react'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function Page() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, username: true, email: true },
  })

  if (!user) {
    redirect('/')
  }

  return (
    <main>
      <div className="mx-auto max-w-2xl">
        <header className="p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Settings</h1>
          
        </header>
        <SettingsForm user={user} />
      </div>
    </main>
  )
}