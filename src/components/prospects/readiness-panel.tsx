import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { channelLabels, contactFieldLabels } from "@/config/labels";
import { getChannelReadiness } from "@/lib/domain/readiness";
import type { Channel, Prospect } from "@/types/domain";

const channels: Channel[] = ["phone", "visit", "email"];

/**
 * « Exploitabilité » : pour chaque canal, indique si la fiche contient ce qu'il
 * faut pour préparer l'action, et sinon ce qui manque. Une information
 * manquante ne bloque jamais la qualification, seulement l'action concernée.
 */
export function ReadinessPanel({ prospect }: { prospect: Prospect }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions possibles</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2 text-sm">
          {channels.map((channel) => {
            const { ready, missing } = getChannelReadiness(prospect, channel);
            return (
              <li key={channel} className="flex items-start gap-2">
                {ready ? (
                  <Check className="mt-0.5 size-4 text-green-600" aria-hidden />
                ) : (
                  <X className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
                )}
                <span>
                  <span className="font-medium">{channelLabels[channel]}</span>
                  {ready ? (
                    <span className="text-muted-foreground"> : prêt</span>
                  ) : (
                    <span className="text-muted-foreground">
                      {" "}
                      : impossible, {missing.map((f) => contactFieldLabels[f]).join(", ")} manquant
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
