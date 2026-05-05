import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Info,
  Contact,
  MapPin,
  User,
  Smartphone,
  Phone,
  Mail,
  Shield,
  CreditCard,
  Settings,
  LayoutGrid,
  Building2,
} from "lucide-react";
import { distributorApi } from "../api/distributorApi";

const BUSINESS_TYPES = ["Distributor", "Wholesaler", "Retailer", "Manufacturer"];
const PAYMENT_TYPES = ["Credit", "Cash", "Prepaid"];
const ACCOUNT_STATUSES = ["Active", "Inactive", "Suspended"];

const emptyForm = () => ({
  distributorId: "",
  businessType: "Distributor",
  companyName: "",
  payableName: "",
  fullOfficeAddress: "",
  areaCity: "",
  state: "",
  pincode: "",
  contactPersonName: "",
  mobileNumber: "",
  officePhoneNumber: "",
  email: "",
  gstRegistrationNo: "",
  drugLicenseNo: "",
  panNumber: "",
  fssaiLicenseNo: "",
  paymentType: "Credit",
  creditLimitDays: "",
  openingBalance: "",
  accountStatus: "Active",
  notesSpecialRemarks: "",
});

function SectionHeader({ Icon, title }) {
  return (
    <div className="dist-section-head mb-6 flex items-center gap-3 border-b border-[#CFD8DC] pb-3">
      <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#E3F2FD] text-[#1976D2]">
        <Icon size={22} strokeWidth={1.75} aria-hidden />
      </span>
      <h3 className="text-lg font-semibold tracking-tight text-[#263238]">{title}</h3>
    </div>
  );
}

/** @param {{ label: string, required?: boolean, children: React.ReactNode }} props */
function Field({ label, required, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[#455A64]">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function Input(props) {
  const { icon: Icon, className = "", ...rest } = props;
  return (
    <div
      className={`flex overflow-hidden rounded-lg border border-[#CFD8DC] bg-white focus-within:border-[#1976D2] focus-within:ring-1 focus-within:ring-[#1976D2]/40 ${className}`}
    >
      {Icon ? (
        <span className="flex items-center bg-[#FAFAFA] px-3 text-[#78909C]">
          <Icon size={18} strokeWidth={1.75} aria-hidden />
        </span>
      ) : null}
      <input
        className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-[#263238] outline-none placeholder:text-[#90A4AE]"
        {...rest}
      />
    </div>
  );
}

function Select({ icon: Icon, children, ...rest }) {
  return (
    <div className="flex overflow-hidden rounded-lg border border-[#CFD8DC] bg-white focus-within:border-[#1976D2] focus-within:ring-1 focus-within:ring-[#1976D2]/40">
      {Icon ? (
        <span className="flex items-center bg-[#FAFAFA] px-3 text-[#78909C]">
          <Icon size={18} strokeWidth={1.75} aria-hidden />
        </span>
      ) : null}
      <select
        className="min-w-0 flex-1 cursor-pointer border-0 bg-transparent px-3 py-2.5 text-sm text-[#263238] outline-none"
        {...rest}
      >
        {children}
      </select>
    </div>
  );
}

const AdminDistributorsPanel = () => {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [list, setList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const refreshId = useCallback(async () => {
    try {
      const { distributorId } = await distributorApi.suggestId();
      setForm((prev) => ({ ...prev, distributorId }));
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg) {
        setError(`Could not load a distributor ID. Server says: ${msg}`);
      } else {
        setError("Could not load a distributor ID. Sign in again and ensure backend is restarted.");
      }
    }
  }, []);

  const loadList = useCallback(async () => {
    try {
      setLoadingList(true);
      const data = await distributorApi.list();
      setList(data.distributors || []);
    } catch {
      /* optional */
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    refreshId();
    loadList();
  }, [refreshId, loadList]);

  const onChange = (key) => (e) => {
    const v = e.target.value;
    setForm((prev) => ({ ...prev, [key]: v }));
    setSuccess("");
    setError("");
  };

  const discard = async () => {
    setForm(emptyForm());
    setSuccess("");
    setError("");
    await refreshId();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await distributorApi.create({
        distributorId: form.distributorId,
        businessType: form.businessType,
        companyName: form.companyName.trim(),
        payableName: form.payableName.trim(),
        fullOfficeAddress: form.fullOfficeAddress.trim(),
        areaCity: form.areaCity.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        contactPersonName: form.contactPersonName.trim(),
        mobileNumber: form.mobileNumber.trim(),
        officePhoneNumber: form.officePhoneNumber.trim(),
        email: form.email.trim(),
        gstRegistrationNo: form.gstRegistrationNo.trim(),
        drugLicenseNo: form.drugLicenseNo.trim(),
        panNumber: form.panNumber.trim(),
        fssaiLicenseNo: form.fssaiLicenseNo.trim(),
        paymentType: form.paymentType,
        creditLimitDays: form.creditLimitDays === "" ? 0 : Number(form.creditLimitDays),
        openingBalance: form.openingBalance === "" ? 0 : Number(form.openingBalance),
        accountStatus: form.accountStatus,
        notesSpecialRemarks: form.notesSpecialRemarks.trim(),
      });
      setSuccess("Distributor created successfully.");
      setForm(emptyForm());
      await refreshId();
      await loadList();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create distributor.");
    } finally {
      setSubmitting(false);
    }
  };

  const tableRows = useMemo(() => list.slice(0, 12), [list]);

  return (
    <div className="distributors-page mx-auto max-w-6xl">
      <header className="products-head mb-2">
        <div>
          <h2>Distributors</h2>
          <p>Create distributor accounts aligned with compliance, payment terms, and contact records.</p>
        </div>
      </header>

      {success ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-[#E3F2FD] bg-white p-6 shadow-sm sm:p-8"
      >
        <SectionHeader Icon={Info} title="Basic Details" />

        <div className="mb-10 grid gap-4 md:grid-cols-2">
          <Field label="Distributor ID">
            <Input
              icon={LayoutGrid}
              name="distributorId"
              value={form.distributorId}
              readOnly
              className="bg-[#FAFAFA]"
            />
          </Field>
          <Field label="Business Type">
            <Select icon={Building2} name="businessType" value={form.businessType} onChange={onChange("businessType")}>
              {BUSINESS_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Company Name" required>
            <Input
              placeholder="Legal business name"
              value={form.companyName}
              onChange={onChange("companyName")}
              required
            />
          </Field>
          <Field label="Payable Name" required>
            <Input
              placeholder="Name on invoices"
              value={form.payableName}
              onChange={onChange("payableName")}
              required
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Full Office Address" required>
              <Input
                icon={MapPin}
                placeholder="Street, building, landmark"
                value={form.fullOfficeAddress}
                onChange={onChange("fullOfficeAddress")}
                required
              />
            </Field>
          </div>
          <Field label="Area / City" required>
            <Input value={form.areaCity} onChange={onChange("areaCity")} required />
          </Field>
          <Field label="State" required>
            <Input value={form.state} onChange={onChange("state")} required />
          </Field>
          <Field label="Pincode" required>
            <Input value={form.pincode} onChange={onChange("pincode")} required />
          </Field>
        </div>

        <SectionHeader Icon={Contact} title="Contact Information" />

        <div className="mb-10 grid gap-4 md:grid-cols-2">
          <Field label="Contact Person Name" required>
            <Input
              icon={User}
              value={form.contactPersonName}
              onChange={onChange("contactPersonName")}
              required
            />
          </Field>
          <Field label="Mobile Number" required>
            <Input
              icon={Smartphone}
              placeholder="+91 ..."
              value={form.mobileNumber}
              onChange={onChange("mobileNumber")}
              required
            />
          </Field>
          <Field label="Office Phone Number" required>
            <Input
              icon={Phone}
              value={form.officePhoneNumber}
              onChange={onChange("officePhoneNumber")}
              required
            />
          </Field>
          <Field label="Email Address" required>
            <Input
              icon={Mail}
              type="email"
              value={form.email}
              onChange={onChange("email")}
              required
            />
          </Field>
        </div>

        <SectionHeader Icon={Shield} title="Legal & Compliance" />

        <div className="mb-10 grid gap-4 md:grid-cols-2">
          <Field label="GST Registration No" required>
            <Input value={form.gstRegistrationNo} onChange={onChange("gstRegistrationNo")} required />
          </Field>
          <Field label="Drug License No" required>
            <Input value={form.drugLicenseNo} onChange={onChange("drugLicenseNo")} required />
          </Field>
          <Field label="PAN Number">
            <Input value={form.panNumber} onChange={onChange("panNumber")} />
          </Field>
          <Field label="FSSAI License No">
            <Input value={form.fssaiLicenseNo} onChange={onChange("fssaiLicenseNo")} />
          </Field>
        </div>

        <SectionHeader Icon={CreditCard} title="Payment Terms" />

        <div className="mb-10 grid gap-4 md:grid-cols-3">
          <Field label="Payment Type">
            <Select icon={CreditCard} value={form.paymentType} onChange={onChange("paymentType")}>
              {PAYMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Credit Limit (Days)" required>
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={form.creditLimitDays}
              onChange={onChange("creditLimitDays")}
              required
            />
          </Field>
          <Field label="Opening Balance">
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.openingBalance}
              onChange={onChange("openingBalance")}
            />
          </Field>
        </div>

        <SectionHeader Icon={Settings} title="Additional Settings" />

        <div className="mb-10 grid gap-4 md:grid-cols-2">
          <Field label="Account Status">
            <Select icon={Settings} value={form.accountStatus} onChange={onChange("accountStatus")}>
              {ACCOUNT_STATUSES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Notes / Special Remarks">
              <textarea
                rows={3}
                className="w-full rounded-lg border border-[#CFD8DC] bg-white px-3 py-2.5 text-sm text-[#263238] outline-none placeholder:text-[#90A4AE] focus:border-[#1976D2] focus:ring-1 focus:ring-[#1976D2]/40"
                placeholder="Delivery windows, rebates, approvals…"
                value={form.notesSpecialRemarks}
                onChange={onChange("notesSpecialRemarks")}
              />
            </Field>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-[#ECEFF1] pt-6">
          <button
            type="button"
            className="rounded-lg border-2 border-[#1976D2] bg-white px-5 py-2.5 text-sm font-semibold text-[#1976D2] transition hover:bg-[#E3F2FD]"
            onClick={discard}
            disabled={submitting}
          >
            Discard Changes
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#1976D2] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1565C0] disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Saving…" : "Create Distributor"}
          </button>
        </div>
      </form>

      <section className="mt-10 rounded-2xl border border-[#E3F2FD] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-[#263238]">Recent distributors</h3>
        {loadingList ? (
          <p className="text-sm text-[#78909C]">Loading…</p>
        ) : tableRows.length === 0 ? (
          <p className="text-sm text-[#78909C]">No distributors yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#ECEFF1] text-xs uppercase tracking-wide text-[#78909C]">
                  <th className="py-2 pr-4 font-semibold">ID</th>
                  <th className="py-2 pr-4 font-semibold">Company</th>
                  <th className="py-2 pr-4 font-semibold">City</th>
                  <th className="py-2 pr-4 font-semibold">Status</th>
                  <th className="py-2 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((d) => (
                  <tr key={d._id} className="border-b border-[#F5F5F5] text-[#37474F]">
                    <td className="py-2.5 pr-4 font-mono text-xs">{d.distributorId}</td>
                    <td className="py-2.5 pr-4">{d.companyName}</td>
                    <td className="py-2.5 pr-4">{d.areaCity}</td>
                    <td className="py-2.5 pr-4">
                      <span className="rounded-full bg-[#E3F2FD] px-2 py-0.5 text-xs font-medium text-[#1565C0]">
                        {d.accountStatus}
                      </span>
                    </td>
                    <td className="py-2.5 text-xs text-[#90A4AE]">
                      {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDistributorsPanel;
