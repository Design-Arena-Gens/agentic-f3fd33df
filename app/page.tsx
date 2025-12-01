"use client";

import Image from "next/image";
import { useMemo, useState, type ReactNode } from "react";
import styles from "./page.module.css";

type Entry = {
  id: string;
  plateNumber: string;
  yukBilan: number;
  yuksiz: number;
  sofVazin: number;
  date: string;
  price: number;
  checkNumber: string;
};

type FormState = {
  plateNumber: string;
  yukBilan: string;
  yuksiz: string;
  date: string;
  price: string;
  checkNumber: string;
};

const initialEntries: Entry[] = [
  {
    id: "ENT-001",
    plateNumber: "90A123BA",
    yukBilan: 5400,
    yuksiz: 3200,
    sofVazin: 5400 - 3200,
    date: "2024-03-12",
    price: 40000,
    checkNumber: "CHK-84721"
  },
  {
    id: "ENT-002",
    plateNumber: "01Z456TR",
    yukBilan: 6200,
    yuksiz: 3600,
    sofVazin: 6200 - 3600,
    date: "2024-03-15",
    price: 30000,
    checkNumber: "CHK-84722"
  }
];

const defaultFormState: FormState = {
  plateNumber: "",
  yukBilan: "",
  yuksiz: "",
  date: new Date().toISOString().slice(0, 10),
  price: "30000",
  checkNumber: ""
};

function highlight(value: string | number, query: string): ReactNode {
  const text = String(value);
  if (!query.trim()) {
    return text;
  }

  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) {
    return text;
  }

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);

  return (
    <>
      {before}
      <span className={styles.matchText}>{match}</span>
      {highlight(after, query)}
    </>
  );
}

export default function Page() {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [formState, setFormState] = useState<FormState>(defaultFormState);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [relayArmed, setRelayArmed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const computedSofVazin = useMemo(() => {
    const yuk = Number(formState.yukBilan) || 0;
    const yuksiz = Number(formState.yuksiz) || 0;
    const result = yuk - yuksiz;
    return Number.isFinite(result) ? Math.max(result, 0) : 0;
  }, [formState.yukBilan, formState.yuksiz]);

  const filteredEntries = useMemo(() => {
    if (!searchTerm.trim()) {
      return entries;
    }
    const query = searchTerm.toLowerCase();
    return entries.filter((entry) =>
      [
        entry.plateNumber,
        entry.yukBilan,
        entry.yuksiz,
        entry.sofVazin,
        entry.date,
        entry.price,
        entry.checkNumber
      ]
        .map((field) => String(field).toLowerCase())
        .some((value) => value.includes(query))
    );
  }, [entries, searchTerm]);

  const handleInputChange = (
    field: keyof FormState,
    value: string
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormState(defaultFormState);
    setSelectedEntryId(null);
  };

  const handleAdd = () => {
    const plate = formState.plateNumber.trim();
    if (!plate) {
      return;
    }

    const randomId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2, 8);

    const newEntry: Entry = {
      id: `ENT-${randomId.slice(0, 6).toUpperCase()}`,
      plateNumber: plate.toUpperCase(),
      yukBilan: Number(formState.yukBilan) || 0,
      yuksiz: Number(formState.yuksiz) || 0,
      sofVazin: computedSofVazin,
      date: formState.date,
      price: Number(formState.price) || 0,
      checkNumber: formState.checkNumber.trim() || `CHK-${Date.now()}`
    };

    setEntries((prev) => [newEntry, ...prev]);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedEntryId) {
      return;
    }

    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === selectedEntryId
          ? {
              ...entry,
              plateNumber: formState.plateNumber.trim().toUpperCase(),
              yukBilan: Number(formState.yukBilan) || 0,
              yuksiz: Number(formState.yuksiz) || 0,
              sofVazin: computedSofVazin,
              date: formState.date,
              price: Number(formState.price) || 0,
              checkNumber: formState.checkNumber.trim()
            }
          : entry
      )
    );
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedEntryId) {
      return;
    }
    setEntries((prev) =>
      prev.filter((entry) => entry.id !== selectedEntryId)
    );
    resetForm();
  };

  const handleReload = () => {
    setEntries(initialEntries.map((entry) => ({ ...entry })));
    resetForm();
    setRelayArmed(false);
    setSearchTerm("");
  };

  const handleRelay = () => {
    setRelayArmed((prev) => !prev);
  };

  const handleSelect = (entry: Entry) => {
    setSelectedEntryId(entry.id);
    setFormState({
      plateNumber: entry.plateNumber,
      yukBilan: String(entry.yukBilan),
      yuksiz: String(entry.yuksiz),
      date: entry.date,
      price: String(entry.price),
      checkNumber: entry.checkNumber
    });
  };

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Image
            src="/camel-logo.svg"
            alt="Camel Logistics"
            width={64}
            height={64}
            className={styles.brandLogo}
            priority
          />
          <div className={styles.brandText}>
            <h1>Camel Weigh Station</h1>
            <span>Desert Freight Balance Hub</span>
          </div>
        </div>

        <div className={styles.searchZone}>
          <div className={styles.alarm}>
            <span className={styles.alarmDot} />
            Alarm Active
          </div>
          <label className={styles.searchBar}>
            <svg
              aria-hidden
              className={styles.moonIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 0 1 12.21 3 7 7 0 0 0 12 17a7 7 0 0 0 9-4.21z" />
            </svg>
            <input
              className={styles.searchInput}
              placeholder="Search manifest..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
        </div>
      </header>

      <div className={styles.actions}>
        <button className={styles.actionButton} onClick={handleAdd}>
          Add
        </button>
        <button
          className={styles.actionButton}
          onClick={handleEdit}
          disabled={!selectedEntryId}
        >
          Edit
        </button>
        <button
          className={styles.actionButton}
          onClick={handleDelete}
          disabled={!selectedEntryId}
        >
          Delete
        </button>
        <button
          className={`${styles.actionButton} ${styles.secondary}`}
          onClick={() => window.print()}
        >
          Print
        </button>
        <button
          className={`${styles.actionButton} ${styles.secondary}`}
          onClick={handleReload}
        >
          Reload
        </button>
        <button
          className={styles.actionButton}
          onClick={handleRelay}
        >
          Relay
        </button>
      </div>

      <section className={styles.formSection}>
        <div className={styles.field}>
          <label htmlFor="plateNumber">Plate Number</label>
          <input
            id="plateNumber"
            className={styles.input}
            value={formState.plateNumber}
            onChange={(event) =>
              handleInputChange("plateNumber", event.target.value)
            }
            placeholder="e.g. 90A123BA"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="yukBilan">Yuk bilan (Kg)</label>
          <input
            id="yukBilan"
            type="number"
            className={styles.input}
            value={formState.yukBilan}
            onChange={(event) =>
              handleInputChange("yukBilan", event.target.value)
            }
            placeholder="Loaded weight"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="yuksiz">Yuksiz (Kg)</label>
          <input
            id="yuksiz"
            type="number"
            className={styles.input}
            value={formState.yuksiz}
            onChange={(event) =>
              handleInputChange("yuksiz", event.target.value)
            }
            placeholder="Empty weight"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="sofVazin">Sof Vazin (Kg)</label>
          <input
            id="sofVazin"
            className={styles.input}
            value={computedSofVazin}
            readOnly
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            className={styles.input}
            value={formState.date}
            onChange={(event) =>
              handleInputChange("date", event.target.value)
            }
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="price">Summa</label>
          <input
            id="price"
            type="number"
            className={styles.input}
            value={formState.price}
            onChange={(event) =>
              handleInputChange("price", event.target.value)
            }
            placeholder="30000"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="checkNumber">Add-on Check Number</label>
          <input
            id="checkNumber"
            className={styles.input}
            value={formState.checkNumber}
            onChange={(event) =>
              handleInputChange("checkNumber", event.target.value)
            }
            placeholder="CHK-XXXXX"
          />
        </div>
      </section>

      <section className={styles.tableSection}>
        <table>
          <thead>
            <tr>
              <th>Plate_Number</th>
              <th>Yuk_bilan</th>
              <th>Sana (Date)</th>
              <th>Yuksiz</th>
              <th>Sof_Vazin</th>
              <th>Price</th>
              <th>Check</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.datatableEmpty}>
                  No records found.
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => {
                const isSelected = entry.id === selectedEntryId;
                const matchQuery = searchTerm.trim();

                return (
                  <tr
                    key={entry.id}
                    className={isSelected ? styles.activeRow : undefined}
                    onClick={() => handleSelect(entry)}
                  >
                    <td>
                      {matchQuery
                        ? highlight(entry.plateNumber, matchQuery)
                        : entry.plateNumber}
                    </td>
                    <td>
                      {matchQuery
                        ? highlight(entry.yukBilan, matchQuery)
                        : entry.yukBilan}
                    </td>
                    <td>
                      {matchQuery
                        ? highlight(entry.date, matchQuery)
                        : entry.date}
                    </td>
                    <td>
                      {matchQuery
                        ? highlight(entry.yuksiz, matchQuery)
                        : entry.yuksiz}
                    </td>
                    <td>
                      {matchQuery
                        ? highlight(entry.sofVazin, matchQuery)
                        : entry.sofVazin}
                    </td>
                    <td>
                      {matchQuery
                        ? highlight(entry.price.toLocaleString(), matchQuery)
                        : entry.price.toLocaleString()}
                    </td>
                    <td>
                      {matchQuery
                        ? highlight(entry.checkNumber, matchQuery)
                        : entry.checkNumber}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>

      <div
        className={`${styles.relayBanner} ${
          relayArmed ? styles.relayActive : ""
        }`}
      >
        <span>Relay Channel {relayArmed ? "Armed" : "Standby"}</span>
        <span>{relayArmed ? "Signal live across all outposts." : "Awaiting dispatch."}</span>
      </div>
    </main>
  );
}
