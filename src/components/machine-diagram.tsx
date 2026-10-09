/*
 * Side view of the machine: water goes reservoir → pump → flow meter → along
 * the arm to the nozzle on the carriage. A schematic, not a drawing to scale.
 */

// Parts that carry water are labelled in water blue.
const label = "fill-husk font-mono";
const leader = "stroke-rule";

export function MachineDiagram() {
  return (
    <figure>
      <svg
        viewBox="0 0 400 280"
        className="block w-full"
        role="img"
        aria-label="Side view: a column with an arm on top, a carriage and nozzle riding the arm over a dripper, and water piped from a reservoir through a pump and flow meter to the nozzle."
      >
        <g className="fill-grounds stroke-husk" strokeWidth="1.5" strokeLinejoin="round">
          {/* Base, column and the angle stepper on top of it. */}
          <rect x="16" y="252" width="368" height="12" rx="2" />
          <rect x="40" y="58" width="22" height="194" />
          <rect x="33" y="32" width="36" height="26" rx="2" />

          {/* Arm, with the radius stepper at its end and the carriage below. */}
          <rect x="62" y="62" width="268" height="12" />
          <rect x="318" y="46" width="26" height="26" rx="2" />
          <rect x="248" y="74" width="24" height="10" rx="1" />

          {/* Reservoir. */}
          <rect x="80" y="168" width="56" height="84" rx="3" />

          {/* Dripper on its server. */}
          <path d="M220 124 H300 L268 176 H252 Z" />
          <rect x="230" y="176" width="60" height="5" />
          <rect x="228" y="181" width="64" height="71" rx="6" />
        </g>

        {/* Belt between the steppers. */}
        <line x1="70" y1="68" x2="318" y2="68" className="stroke-husk" strokeDasharray="3 3" />

        {/* Water: in the reservoir, through the tube, out of the nozzle. */}
        <rect x="83" y="204" width="50" height="45" className="fill-water-deeper" />
        <path
          d="M108 228 V150 M108 130 V116 M108 104 V80 H248"
          fill="none"
          className="stroke-water"
          strokeWidth="1.5"
        />
        <line x1="260" y1="84" x2="260" y2="96" className="stroke-husk" strokeWidth="3" />
        <line
          x1="260"
          y1="100"
          x2="260"
          y2="140"
          className="stroke-water"
          strokeWidth="2"
          strokeDasharray="4 3"
        />

        {/* Coffee in the server. */}
        <rect x="231" y="222" width="58" height="27" rx="2" className="fill-rule/40" />

        {/* Pump and flow meter in the line. */}
        <g className="fill-roast stroke-water" strokeWidth="1.5">
          <circle cx="108" cy="140" r="10" />
          <rect x="100" y="104" width="16" height="12" rx="1" />
        </g>

        <g fill="none" className={leader} strokeWidth="0.75">
          <path d="M69 38 H80" />
          <path d="M331 46 V36" />
          <path d="M180 68 V54" />
          <path d="M272 84 L282 98" />
          <path d="M116 110 H126" />
          <path d="M118 140 H126" />
          <path d="M286 150 H304" />
          <path d="M292 214 H304" />
        </g>
        <g className={label} fontSize="10">
          <text x="84" y="41">
            angle stepper
          </text>
          <text x="331" y="31" textAnchor="middle">
            radius stepper
          </text>
          <text x="180" y="50" textAnchor="middle">
            belt
          </text>
          <text x="284" y="108" className="fill-water">
            carriage + nozzle
          </text>
          <text x="130" y="113" className="fill-water">
            flow meter
          </text>
          <text x="130" y="143" className="fill-water">
            pump
          </text>
          <text x="80" y="162" className="fill-water">
            reservoir
          </text>
          <text x="308" y="153">
            dripper
          </text>
          <text x="308" y="217">
            server
          </text>
        </g>
      </svg>
      <figcaption className="mt-3 text-sm text-husk">Schematic, not to scale.</figcaption>
    </figure>
  );
}
