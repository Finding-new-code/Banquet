"use client";

import { useState } from "react";
import { useAuditLogs, AuditLog, AuditAction, AuditSeverity } from "@/hooks/useAdmin";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, Search, ShieldCheck, User, FileText } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const auditActions: AuditAction[] = [
    "LOGIN_SUCCESS",
    "LOGIN_FAILURE",
    "LOGOUT",
    "REGISTER",
    "PASSWORD_CHANGE",
    "PASSWORD_RESET_REQUEST",
    "PASSWORD_RESET_COMPLETE",
    "TOKEN_REFRESH",
    "TOKEN_REVOKE",
    "USER_CREATE",
    "USER_UPDATE",
    "USER_DELETE",
    "USER_DEACTIVATE",
    "PROFILE_UPDATE",
    "BOOKING_CREATE",
    "BOOKING_UPDATE",
    "BOOKING_CANCEL",
    "BOOKING_CONFIRM",
    "BANQUET_CREATE",
    "BANQUET_UPDATE",
    "BANQUET_DELETE",
    "ADMIN_ACTION",
    "PERMISSION_CHANGE",
];

const severities: AuditSeverity[] = ["INFO", "WARNING", "CRITICAL"];

function getSeverityColor(severity: AuditSeverity) {
    switch (severity) {
        case "INFO":
            return "default";
        case "WARNING":
            return "secondary";
        case "CRITICAL":
            return "destructive";
        default:
            return "outline";
    }
}

function getActionIcon(action: AuditAction) {
    if (action.includes("LOGIN") || action.includes("LOGOUT") || action.includes("USER")) {
        return <User className="h-4 w-4" />;
    }
    if (action.includes("PASSWORD") || action.includes("TOKEN")) {
        return <ShieldCheck className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
}

function AuditLogRow({ log }: { log: AuditLog }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <TableRow className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <TableCell>
                    {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="font-medium">{log.action}</span>
                    </div>
                </TableCell>
                <TableCell>
                    <Badge variant={getSeverityColor(log.severity)}>{log.severity}</Badge>
                </TableCell>
                <TableCell>
                    {log.email ? (
                        <span className="text-sm">{log.email}</span>
                    ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                    )}
                </TableCell>
                <TableCell className="max-w-md truncate">
                    <span className="text-sm text-muted-foreground">{log.description}</span>
                </TableCell>
                <TableCell>
                    <span className="text-xs text-muted-foreground font-mono">
                        {log.ipAddress || "-"}
                    </span>
                </TableCell>
                <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {expanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </Button>
                </TableCell>
            </TableRow>
            {expanded && (
                <TableRow>
                    <TableCell colSpan={7}>
                        <Card className="m-2">
                            <CardContent className="p-4 space-y-2">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-semibold">User ID:</span>{" "}
                                        {log.userId || "-"}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Resource Type:</span>{" "}
                                        {log.resourceType || "-"}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Resource ID:</span>{" "}
                                        {log.resourceId || "-"}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Correlation ID:</span>{" "}
                                        {log.correlationId || "-"}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Success:</span>{" "}
                                        {log.success ? (
                                            <span className="text-green-600">Yes</span>
                                        ) : (
                                            <span className="text-red-600">No</span>
                                        )}
                                    </div>
                                    {log.errorMessage && (
                                        <div className="col-span-2">
                                            <span className="font-semibold text-red-600">Error:</span>{" "}
                                            {log.errorMessage}
                                        </div>
                                    )}
                                </div>
                                {log.metadata && Object.keys(log.metadata).length > 0 && (
                                    <div className="mt-2">
                                        <span className="font-semibold text-sm">Metadata:</span>
                                        <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                                            {JSON.stringify(log.metadata, null, 2)}
                                        </pre>
                                    </div>
                                )}
                                {log.userAgent && (
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        <span className="font-semibold">User Agent:</span> {log.userAgent}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}

export default function AuditLogsPage() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(50);
    const [action, setAction] = useState<AuditAction | undefined>();
    const [severity, setSeverity] = useState<AuditSeverity | undefined>();
    const [email, setEmail] = useState("");

    const filters = { page, limit, action, severity, email: email || undefined };
    const { data, isLoading } = useAuditLogs(filters);

    const logs = data?.data || [];
    const pagination = data?.pagination;

    if (isLoading) {
        return (
            <div className="p-4 space-y-4">
                <Skeleton className="h-10 w-[250px]" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
            </div>

            <div className="flex flex-wrap gap-4 items-center py-4">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by email..."
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setPage(1);
                        }}
                        className="pl-8"
                    />
                </div>
                <Select
                    value={action || "all"}
                    onValueChange={(v) => {
                        setAction(v === "all" ? undefined : v as AuditAction);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by action" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        {auditActions.map((a) => (
                            <SelectItem key={a} value={a}>
                                {a}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={severity || "all"}
                    onValueChange={(v) => {
                        setSeverity(v === "all" ? undefined : v as AuditSeverity);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by severity" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Severities</SelectItem>
                        {severities.map((s) => (
                            <SelectItem key={s} value={s}>
                                {s}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={limit.toString()} onValueChange={(v) => setLimit(Number(v))}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Per page" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="25">25 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                        <SelectItem value="100">100 per page</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Severity</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead className="text-right">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No audit logs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log: AuditLog) => <AuditLogRow key={log._id} log={log} />)
                        )}
                    </TableBody>
                </Table>
            </div>

            {pagination && pagination.pages > 1 && (
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                        Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                            disabled={page === pagination.pages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
