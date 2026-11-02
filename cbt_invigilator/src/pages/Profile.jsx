import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  AtSign,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Edit3,
  KeyRound,
  Loader2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { updateInvigilator } from "../services/invigilatorApi";

const Profile = () => {
  const { invigilator, setInvigilator } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    image: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* =========================================================
     LOAD PROFILE
  ========================================================= */
  useEffect(() => {
    if (!invigilator) return;

    setForm({
      name: invigilator.name || "",
      phone: invigilator.phone || "",
      image: invigilator.image || "",
    });
  }, [invigilator]);

  /* =========================================================
     SUCCESS MESSAGE
  ========================================================= */
  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [successMessage]);

  /* =========================================================
     INPUT CHANGE
  ========================================================= */
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     CANCEL
  ========================================================= */
  const handleCancel = () => {
    setForm({
      name: invigilator?.name || "",
      phone: invigilator?.phone || "",
      image: invigilator?.image || "",
    });

    setEditing(false);
    setError("");
  };

  /* =========================================================
     SAVE
  ========================================================= */
  const handleSave = async (event) => {
    event.preventDefault();

    const invigilatorId =
      invigilator?._id || invigilator?.id;

    if (!invigilatorId) {
      setError("Invigilator ID not found.");
      return;
    }

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await updateInvigilator(
        invigilatorId,
        {
          name: form.name.trim(),
          phone: form.phone.trim(),
          image: form.image.trim() || null,
        }
      );

      const updated =
        response?.invigilator ||
        response?.data ||
        response?.user;

      const updatedInvigilator = {
        ...invigilator,
        ...(updated || {}),
        name: form.name.trim(),
        phone: form.phone.trim(),
        image: form.image.trim() || null,
      };

      setInvigilator(updatedInvigilator);

      localStorage.setItem(
        "invigilator",
        JSON.stringify(updatedInvigilator)
      );

      setEditing(false);

      setSuccessMessage(
        "Profile updated successfully."
      );
    } catch (err) {
      console.error("Profile update error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-enter min-h-screen bg-[var(--color-page)]">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* =====================================================
            HEADER
        ====================================================== */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-6 shadow-sm sm:px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary-light)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]">
                <UserRound size={14} />
                Account Settings
              </div>

              <h1 className="text-2xl font-bold text-[var(--color-heading)] sm:text-3xl">
                My Profile
              </h1>

              <p className="mt-1.5 text-sm text-[var(--color-muted)]">
                View and manage your invigilator account
                information.
              </p>
            </div>

            {!editing ? (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setEditing(true);
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-page)]"
              >
                <X size={16} />
                Cancel
              </button>
            )}
          </div>
        </section>

        {/* =====================================================
            ERROR
        ====================================================== */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-light)] px-4 py-3.5 text-sm text-[var(--color-danger)]">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span className="flex-1">
              {error}
            </span>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 hover:bg-[var(--color-danger-light)]"
            >
              <XCircle size={16} />
            </button>
          </div>
        )}

        {/* =====================================================
            SUCCESS
        ====================================================== */}
        {successMessage && (
          <div className="flex items-center gap-3 rounded-xl border border-[var(--color-success-border)] bg-[var(--color-success-light)] px-4 py-3.5 text-sm font-medium text-[var(--color-success)]">
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        )}

        {/* =====================================================
            PROFILE HERO
        ====================================================== */}
        <section className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          <div className="h-24 bg-[var(--color-primary)] sm:h-28" />

          <div className="px-5 pb-6 sm:px-6">

            <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div className="flex items-end gap-4">

                <ProfileAvatar
                  name={invigilator?.name}
                  image={invigilator?.image}
                />

                <div className="pb-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <h2 className="text-xl font-bold text-[var(--color-heading)]">
                      {invigilator?.name ||
                        "Invigilator"}
                    </h2>

                    {invigilator?.status ===
                      "active" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-success-light)] px-2.5 py-1 text-[10px] font-bold text-[var(--color-success)]">
                        <BadgeCheck size={12} />
                        Active
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    Examination Invigilator
                  </p>
                </div>
              </div>

              <div className="hidden items-center gap-2 rounded-lg bg-[var(--color-page)] px-3 py-2 sm:flex">
                <ShieldCheck
                  size={16}
                  className="text-[var(--color-primary)]"
                />

                <span className="text-xs font-semibold text-[var(--color-text)]">
                  Verified Staff Account
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_0.8fr]">

          {/* PERSONAL INFORMATION */}
          <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-5">

              <div>
                <h2 className="text-base font-semibold text-[var(--color-heading)]">
                  Personal Information
                </h2>

                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Your registered staff details
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                <User size={17} />
              </div>
            </div>

            {editing ? (
              <form
                onSubmit={handleSave}
                className="mt-6 space-y-5"
              >
                <ProfileInput
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  icon={User}
                  required
                />

                <div className="grid gap-5 sm:grid-cols-2">

                  <ReadOnlyInput
                    label="Email Address"
                    value={invigilator?.email || ""}
                    icon={Mail}
                  />

                  <ReadOnlyInput
                    label="Employee ID"
                    value={
                      invigilator?.employeeId || ""
                    }
                    icon={BriefcaseBusiness}
                  />

                </div>

                <ProfileInput
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  icon={Phone}
                  placeholder="Enter phone number"
                />

                <ProfileInput
                  label="Profile Image URL"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  icon={AtSign}
                  placeholder="https://..."
                />

                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-page)] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Save size={16} />
                    )}

                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>
              </form>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">

                <InfoCard
                  icon={User}
                  label="Full Name"
                  value={
                    invigilator?.name ||
                    "Not available"
                  }
                />

                <InfoCard
                  icon={Mail}
                  label="Email Address"
                  value={
                    invigilator?.email ||
                    "Not available"
                  }
                />

                <InfoCard
                  icon={BriefcaseBusiness}
                  label="Employee ID"
                  value={
                    invigilator?.employeeId ||
                    "Not available"
                  }
                />

                <InfoCard
                  icon={Phone}
                  label="Phone Number"
                  value={
                    invigilator?.phone ||
                    "Not provided"
                  }
                />

              </div>
            )}
          </section>

          {/* ACCOUNT STATUS */}
          <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-5">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                <ShieldCheck size={17} />
              </div>

              <div>
                <h2 className="text-base font-semibold text-[var(--color-heading)]">
                  Account Status
                </h2>

                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Security and account information
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">

              <AccountRow
                icon={BadgeCheck}
                label="Account Status"
                value={
                  invigilator?.status ===
                  "active"
                    ? "Active"
                    : "Inactive"
                }
                valueClass={
                  invigilator?.status ===
                  "active"
                    ? "text-[var(--color-success)]"
                    : "text-[var(--color-danger)]"
                }
              />

              <AccountRow
                icon={BriefcaseBusiness}
                label="Role"
                value="Invigilator"
              />

              <AccountRow
                icon={Mail}
                label="Login Email"
                value={invigilator?.email || "—"}
              />

              <AccountRow
                icon={KeyRound}
                label="Password"
                value="••••••••"
              />

            </div>

            <div className="mt-5 rounded-xl border border-[var(--color-info-border)] bg-[var(--color-info-light)] p-4">
              <div className="flex items-start gap-3">

                <ShieldCheck
                  size={17}
                  className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                />

                <div>

                  <p className="text-xs font-bold text-[var(--color-primary)]">
                    Secure Account
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-[var(--color-primary)]">
                    Your invigilator account is protected
                    by authenticated access and a secure
                    login session.
                  </p>

                </div>
              </div>
            </div>
          </section>
        </div>

        {/* =====================================================
            STAFF INFORMATION
        ====================================================== */}
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm sm:p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)]">
              <BriefcaseBusiness size={18} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-[var(--color-heading)]">
                Invigilator Information
              </h2>

              <p className="mt-1 text-xs text-[var(--color-muted)]">
                Official identification details
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">

            <InfoCard
              icon={BadgeCheck}
              label="Employee ID"
              value={
                invigilator?.employeeId || "—"
              }
            />

            <InfoCard
              icon={BriefcaseBusiness}
              label="Designation"
              value="Examination Invigilator"
            />

            <InfoCard
              icon={ShieldCheck}
              label="Access Level"
              value="Invigilator"
            />

          </div>
        </section>
      </div>
    </div>
  );
};

/* =========================================================
   PROFILE AVATAR
========================================================= */

const ProfileAvatar = ({ name, image }) => {
  const initials =
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "IN";

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="h-24 w-24 rounded-xl border-4 border-white object-cover shadow-md"
      />
    );
  }

  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-xl border-4 border-white bg-[var(--color-primary)] text-2xl font-bold text-white shadow-md">
      {initials}
    </div>
  );
};

/* =========================================================
   PROFILE INPUT
========================================================= */

const ProfileInput = ({
  label,
  name,
  value,
  onChange,
  icon: Icon,
  placeholder,
  required = false,
}) => (
  <div>
    <label className="mb-2 block text-xs font-semibold text-[var(--color-text)]">
      {label}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>

    <div className="relative">

      <Icon
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-placeholder)]"
      />

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] pl-10 pr-4 text-sm text-[var(--color-text)] placeholder:text-[var(--color-placeholder)] transition focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/10"
      />
    </div>
  </div>
);

/* =========================================================
   READ ONLY INPUT
========================================================= */

const ReadOnlyInput = ({
  label,
  value,
  icon: Icon,
}) => (
  <div>
    <label className="mb-2 block text-xs font-semibold text-[var(--color-text)]">
      {label}
    </label>

    <div className="relative">

      <Icon
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-placeholder)]"
      />

      <input
        type="text"
        value={value}
        readOnly
        className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] pl-10 pr-4 text-sm text-[var(--color-muted)]"
      />
    </div>
  </div>
);

/* =========================================================
   INFO CARD
========================================================= */

const InfoCard = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-page)] p-4 transition hover:border-[var(--color-primary)]">

    <div className="flex items-center gap-2 text-[var(--color-muted)]">
      <Icon size={14} />

      <span className="text-[10px] font-bold uppercase tracking-wider">
        {label}
      </span>
    </div>

    <p className="mt-2 truncate text-sm font-semibold text-[var(--color-text)]">
      {value}
    </p>
  </div>
);

/* =========================================================
   ACCOUNT ROW
========================================================= */

const AccountRow = ({
  icon: Icon,
  label,
  value,
  valueClass = "text-[var(--color-text)]",
}) => (
  <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] px-3.5 py-3">

    <div className="flex min-w-0 items-center gap-2.5">

      <Icon
        size={15}
        className="shrink-0 text-[var(--color-muted)]"
      />

      <span className="text-xs font-medium text-[var(--color-muted)]">
        {label}
      </span>
    </div>

    <span
      className={`
        max-w-[55%]
        truncate
        text-right
        text-xs
        font-bold
        ${valueClass}
      `}
    >
      {value}
    </span>
  </div>
);

export default Profile;