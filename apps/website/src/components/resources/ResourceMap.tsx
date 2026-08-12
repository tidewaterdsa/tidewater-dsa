import { useMemo, useState } from "react"
import type { FeatureCollection, Point } from "geojson"
import {
  Map,
  MapClusterLayer,
  MapPopup,
  MapControls,
} from "@tidewater-dsa/ui/components/map"
import { Card } from "@tidewater-dsa/ui/components/card"
import { Button, buttonVariants } from "@tidewater-dsa/ui/components/button"
import { ExternalLinkIcon } from "lucide-react"
import { cn } from "@tidewater-dsa/ui/lib/utils"
import { REGION_CENTER, REGION_DEFAULT_ZOOM } from "@/lib/region"
import { buildGoogleMapsUrl } from "@/lib/google-maps"
import type { Resource } from "@/types"

interface ResourceMapProps {
  resources: Resource[]
  onOpen: (resource: Resource) => void
}

interface PointProps {
  resourceId: string
}

export const ResourceMap = ({ resources, onOpen }: ResourceMapProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const geocoded = useMemo(() => resources.filter((r) => r.coords), [resources])

  const geoJson = useMemo<FeatureCollection<Point, PointProps>>(
    () => ({
      type: "FeatureCollection",
      features: geocoded.map((r) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [r.coords!.lng, r.coords!.lat],
        },
        properties: { resourceId: r.id },
      })),
    }),
    [geocoded]
  )

  const selected = selectedId
    ? (resources.find((r) => r.id === selectedId) ?? null)
    : null

  const mappableCount = geocoded.length
  const totalCount = resources.length
  const missingCount = totalCount - mappableCount

  return (
    <div className="space-y-2">
      <Card className="h-125 overflow-hidden rounded-md p-0">
        <Map
          center={REGION_CENTER}
          zoom={REGION_DEFAULT_ZOOM}
          attributionControl={false}
        >
          <MapClusterLayer<PointProps>
            data={geoJson}
            clusterRadius={50}
            clusterMaxZoom={14}
            pointColor="#dc2626"
            clusterColors={["#b91c1c", "#6d28d9", "#1e40af"]}
            onPointClick={(feature) => {
              const id = feature.properties?.resourceId
              if (typeof id === "string") setSelectedId(id)
            }}
          />

          {selected?.coords && (
            <MapPopup
              key={selected.id}
              longitude={selected.coords.lng}
              latitude={selected.coords.lat}
              onClose={() => setSelectedId(null)}
              closeButton
              className="w-64"
            >
              <div className="space-y-1.5 p-0.5 text-sm">
                <div className="text-sm leading-tight font-bold">
                  {selected.name}
                </div>
                {selected.organization &&
                  selected.organization !== selected.name && (
                    <div className="text-xs text-muted-foreground">
                      {selected.organization}
                    </div>
                  )}
                {selected.fullAddress && (
                  <div className="text-xs text-muted-foreground">
                    {selected.fullAddress.replace(/ · /g, ", ")}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      onOpen(selected)
                      setSelectedId(null)
                    }}
                  >
                    View details
                  </Button>
                  {selected.fullAddress && (
                    <a
                      href={buildGoogleMapsUrl(selected.fullAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "h-7 gap-1 px-2 text-xs"
                      )}
                    >
                      <ExternalLinkIcon className="h-3 w-3" /> Maps
                    </a>
                  )}
                </div>
              </div>
            </MapPopup>
          )}

          <MapControls />
        </Map>
      </Card>
      <p className="text-xs text-muted-foreground">
        {missingCount === 0
          ? `Showing all ${totalCount} resources on the map.`
          : `Showing ${mappableCount} of ${totalCount} resources. ${missingCount} ${
              missingCount === 1 ? "resource doesn't" : "resources don't"
            } have a mappable address. See the Directory view to find them.`}
      </p>
    </div>
  )
}
