"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import type { AdSlot } from "@/lib/types"

export default function ManageAdsPage() {
  const [adSlots, setAdSlots] = useState<AdSlot[]>([])
  const [editingAd, setEditingAd] = useState<AdSlot | null>(null)
  const [adCode, setAdCode] = useState("")

  useEffect(() => {
    fetch("/api/admin/ads")
      .then((res) => res.json())
      .then(setAdSlots)
  }, [])

  const handleEditAd = (ad: AdSlot) => {
    setEditingAd(ad)
    setAdCode(ad.code)
  }

  const handleSaveAd = async () => {
    if (!editingAd) return

    const response = await fetch("/api/admin/ads", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingAd.id,
        code: adCode,
        active: editingAd.active,
      }),
    })

    if (response.ok) {
      const updatedAds = adSlots.map((ad) => (ad.id === editingAd.id ? { ...ad, code: adCode } : ad))
      setAdSlots(updatedAds)
      setEditingAd(null)
      setAdCode("")
    }
  }

  const handleToggleActive = async (ad: AdSlot) => {
    const response = await fetch("/api/admin/ads", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: ad.id,
        code: ad.code,
        active: !ad.active,
      }),
    })

    if (response.ok) {
      const updatedAds = adSlots.map((slot) => (slot.id === ad.id ? { ...slot, active: !slot.active } : slot))
      setAdSlots(updatedAds)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Manage Ad Slots</h1>
          <p className="text-xl text-gray-600">Configure ad codes for different positions</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {adSlots.map((ad) => (
            <Card key={ad.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="capitalize">{ad.position} Ad Slot</CardTitle>
                  <Switch checked={ad.active} onCheckedChange={() => handleToggleActive(ad)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Status: {ad.active ? "Active" : "Inactive"}</p>
                    <p className="text-sm text-gray-600">Code Length: {ad.code.length} characters</p>
                  </div>

                  <Button onClick={() => handleEditAd(ad)} variant="outline" className="w-full">
                    Edit Ad Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {editingAd && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Edit {editingAd.position} Ad Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={adCode}
                  onChange={(e) => setAdCode(e.target.value)}
                  placeholder="Paste your ad code here..."
                  rows={10}
                  className="font-mono text-sm"
                />
                <div className="flex space-x-4">
                  <Button onClick={handleSaveAd}>Save Ad Code</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingAd(null)
                      setAdCode("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
