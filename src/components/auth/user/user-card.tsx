'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
/* import { Checkbox } from '@/components/ui/checkbox'; */
/* import CopyButton from '@/components/ui/copy-button'; */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  /* DialogTrigger, */
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
/* import { PasswordInput } from '@/components/ui/password-input'; */
/* import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'; */
import { authClient, signOut, useSession } from '@/lib/auth/client';
import { type Session } from '@/types/auth';
import { MobileIcon } from '@radix-ui/react-icons';
/* import { useQuery } from '@tanstack/react-query'; */
import {
  /* Edit, */
  /* Fingerprint, */
  Laptop,
  Loader2,
  LogOut,
  /* Plus,
  QrCode,
  ShieldCheck,
  ShieldOff, */
  Shield,
  StopCircle,
  /* Trash, */
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
/* import QRCode from 'react-qr-code'; */
import { toast } from 'sonner';
import { UAParser } from 'ua-parser-js';

export default function UserCard(props: {
  session: Session | null;
  activeSessions: Session['session'][];
}) {
  const router = useRouter();
  const { data, isPending } = useSession();
  const session = data || props.session;
  const [isTerminating, setIsTerminating] = useState<string>();
  /* const [isPendingTwoFa, setIsPendingTwoFa] = useState<boolean>(false);
  const [twoFaPassword, setTwoFaPassword] = useState<string>('');
  const [twoFactorDialog, setTwoFactorDialog] = useState<boolean>(false);
  const [twoFactorVerifyURI, setTwoFactorVerifyURI] = useState<string>(''); */
  const [isSignOut, setIsSignOut] = useState<boolean>(false);
  const [emailVerificationPending, setEmailVerificationPending] =
    useState<boolean>(false);
  return (
    <Card className="border-border bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-medium text-foreground">User</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8 grid-cols-1">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-9 w-9 sm:flex border border-border/50">
                <AvatarImage
                  src={session?.user?.image || undefined}
                  alt="Avatar"
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                  {session?.user?.name?.charAt(0) || 'UserName'}
                </AvatarFallback>
              </Avatar>
              <div className="grid">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium leading-none text-foreground">
                    {session?.user?.name}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                <Badge 
                  variant="secondary"
                  className="mt-1 text-xs px-2 py-0.5 bg-green-600 hover:bg-green-700 text-white inline-flex items-center gap-1 w-fit rounded-full"
                >
                  <Shield className="h-3 w-3" />
                  {session?.user?.role}
                </Badge>
              </div>
            </div>
            {/* <EditUserDialog /> */}
          </div>
        </div>

        {session?.user &&
          'emailVerified' in session.user &&
          session.user.emailVerified === false && (
            <Alert className="border border-amber-500/20 bg-amber-500/10">
              <AlertTitle className="font-semibold text-amber-400">Verify Your Email Address</AlertTitle>
              <AlertDescription className="text-amber-200/90">
                Please verify your email address. Check your inbox for the
                verification email. If you haven't received the email, click the
                button below to resend.
              </AlertDescription>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 border-amber-500/30 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 hover:text-amber-100"
                onClick={async () => {
                  await authClient.sendVerificationEmail(
                    {
                      email: session?.user?.email || '',
                    },
                    {
                      onRequest(context) {
                        setEmailVerificationPending(true);
                      },
                      onError(context) {
                        toast.error(context.error.message);
                        setEmailVerificationPending(false);
                      },
                      onSuccess() {
                        toast.success('Verification email sent successfully');
                        setEmailVerificationPending(false);
                      },
                    }
                  );
                }}
              >
                {emailVerificationPending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  'Resend Verification Email'
                )}
              </Button>
            </Alert>
          )}

        <div className="border-l-2 border-l-border px-4 w-max gap-1 flex flex-col">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Active Sessions</p>
          {props.activeSessions
            .filter(sessionItem => sessionItem?.userAgent)
            .map(sessionItem => {
              if (!sessionItem) return null;
              return (
                <div key={sessionItem.id} className="mb-2 last:mb-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <div className="flex items-center gap-2 bg-border/40 rounded-lg px-3 py-2">
                      <span className="p-1 rounded-full bg-border/70 flex items-center justify-center">
                        {new UAParser(sessionItem.userAgent || '').getDevice()
                          .type === 'mobile' ? (
                          <MobileIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <Laptop size={14} className="text-muted-foreground" />
                        )}
                      </span>
                      <span>
                        {new UAParser(sessionItem.userAgent || '').getOS().name},{' '}
                        {
                          new UAParser(sessionItem.userAgent || '').getBrowser()
                            .name
                        }
                      </span>
                      <Button
                        variant={
                          sessionItem.id === props.session?.session?.id
                            ? 'destructive'
                            : 'outline'
                        }
                        size="sm"
                        className={`ml-auto rounded-full transition-all shadow-sm ${
                          sessionItem.id === props.session?.session?.id 
                            ? 'bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 min-w-[90px] flex items-center justify-center' 
                            : 'text-red-600 hover:text-red-700 border-red-200'
                        }`}
                        onClick={async () => {
                          setIsTerminating(sessionItem.id);
                          const res = await authClient.revokeSession({
                            token: sessionItem.token,
                          });

                          if (res.error) {
                            toast.error(res.error.message);
                          } else {
                            toast.success('Session terminated successfully');
                          }
                          router.refresh();
                          setIsTerminating(undefined);
                        }}
                      >
                        {isTerminating === sessionItem.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : sessionItem.id === props.session?.session?.id ? (
                          <span className="flex items-center gap-1.5">
                            <LogOut size={14} className="opacity-90" />
                            Sign Out
                          </span>
                        ) : (
                          'Terminate'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
      <CardFooter className="gap-2 justify-between items-center">
        {/* <ChangePassword /> */}
        {session?.session?.impersonatedBy !== undefined ? (
          <Button
            className="gap-2 z-10"
            variant="secondary"
            onClick={async () => {
              setIsSignOut(true);
              await authClient.admin.stopImpersonating();
              setIsSignOut(false);
              toast.info('Impersonation stopped successfully');
              router.push('/admin');
            }}
            disabled={isSignOut}
          >
            <span className="text-sm">
              {isSignOut ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <StopCircle size={16} color="red" />
                  Stop Impersonation
                </div>
              )}
            </span>
          </Button>
        ) : (
          <Button
            className="gap-2 z-10"
            variant="secondary"
            onClick={async () => {
              setIsSignOut(true);
              await signOut({
                fetchOptions: {
                  onSuccess() {
                    router.push('/');
                  },
                },
              });
              setIsSignOut(false);
            }}
            disabled={isSignOut}
          >
            <span className="text-sm">
              {isSignOut ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <LogOut size={16} />
                  Sign Out
                </div>
              )}
            </span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [signOutDevices, setSignOutDevices] = useState<boolean>(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 z-10" variant="outline" size="sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            aria-label="Change Password"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M2.5 18.5v-1h19v1zm.535-5.973l-.762-.442l.965-1.693h-1.93v-.884h1.93l-.965-1.642l.762-.443L4 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L4 10.835zm8 0l-.762-.442l.966-1.693H9.308v-.884h1.93l-.965-1.642l.762-.443L12 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L12 10.835zm8 0l-.762-.442l.966-1.693h-1.931v-.884h1.93l-.965-1.642l.762-.443L20 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L20 10.835z"
            />
          </svg>
          <span className="text-sm text-muted-foreground">Change Password</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-11/12">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>Change your password</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="current-password">Current Password</Label>
          <PasswordInput
            id="current-password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Password"
          />
          <Label htmlFor="new-password">New Password</Label>
          <PasswordInput
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="New Password"
          />
          <Label htmlFor="password">Confirm Password</Label>
          <PasswordInput
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Confirm Password"
          />
          <div className="flex gap-2 items-center">
            <Checkbox
              onCheckedChange={checked =>
                checked ? setSignOutDevices(true) : setSignOutDevices(false)
              }
            />
            <p className="text-sm">Sign out from other devices</p>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={async () => {
              if (newPassword !== confirmPassword) {
                toast.error('Passwords do not match');
                return;
              }
              if (newPassword.length < 8) {
                toast.error('Password must be at least 8 characters');
                return;
              }
              setLoading(true);
              const res = await authClient.changePassword({
                newPassword: newPassword,
                currentPassword: currentPassword,
                revokeOtherSessions: signOutDevices,
              });
              setLoading(false);
              if (res.error) {
                toast.error(
                  res.error.message ||
                    "Couldn't change your password! Make sure it's correct"
                );
              } else {
                setOpen(false);
                toast.success('Password changed successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }
            }}
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              'Change Password'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} */

function EditUserDialog() {
  const { data, isPending, error } = useSession();
  /* const [name, setName] = useState<string>(); */
  const router = useRouter();
  /* const [image, setImage] = useState<File | null>(null); */
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  /* const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }; */
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger asChild>
        <Button size="sm" className="gap-2" variant="secondary">
          <Edit size={13} />
          Edit User
        </Button>
      </DialogTrigger> */}
      <DialogContent className="sm:max-w-[425px] w-11/12">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Edit user information</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="name"
            placeholder={data?.user?.name}
            required
            /* onChange={e => {
              setName(e.target.value);
            }} */
          />
          <div className="grid gap-2">
            <Label htmlFor="image">Profile Image</Label>
            <div className="flex items-end gap-4">
              {imagePreview && (
                <div className="relative w-16 h-16 rounded-sm overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Profile preview"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 w-full">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  /* onChange={handleImageChange} */
                  className="w-full text-muted-foreground"
                />
                {imagePreview && (
                  <X
                    className="cursor-pointer"
                    onClick={() => {
                      /* setImage(null); */
                      setImagePreview(null);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={isLoading}
            onClick={async () => {
              setIsLoading(true);
              await authClient.updateUser({
                /* image: image ? await convertImageToBase64(image) : undefined,
                name: name ? name : undefined, */
                fetchOptions: {
                  onSuccess: () => {
                    toast.success('User updated successfully');
                  },
                  onError: error => {
                    toast.error(error.error.message);
                  },
                },
              });
              /* setName(''); */
              router.refresh();
              /* setImage(null); */
              setImagePreview(null);
              setIsLoading(false);
              setOpen(false);
            }}
          >
            {isLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              'Update'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* function AddPasskey() {
  const [isOpen, setIsOpen] = useState(false);
  const [passkeyName, setPasskeyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddPasskey = async () => {
    if (!passkeyName) {
      toast.error('Passkey name is required');
      return;
    }
    setIsLoading(true);
    const res = await authClient.passkey.addPasskey({
      name: passkeyName,
    });
    if (res?.error) {
      toast.error(res?.error.message);
    } else {
      setIsOpen(false);
      toast.success('Passkey added successfully. You can now use it to login.');
    }
    setIsLoading(false);
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 text-xs md:text-sm">
          <Plus size={15} />
          Add New Passkey
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-11/12">
        <DialogHeader>
          <DialogTitle>Add New Passkey</DialogTitle>
          <DialogDescription>
            Create a new passkey to securely access your account without a
            password.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="passkey-name">Passkey Name</Label>
          <Input
            id="passkey-name"
            value={passkeyName}
            onChange={e => setPasskeyName(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            disabled={isLoading}
            type="submit"
            onClick={handleAddPasskey}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <>
                <Fingerprint className="mr-2 h-4 w-4" />
                Create Passkey
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} */

/* function ListPasskeys() {
  const { data } = authClient.useListPasskeys();
  const [isOpen, setIsOpen] = useState(false);
  const [passkeyName, setPasskeyName] = useState('');

  const handleAddPasskey = async () => {
    if (!passkeyName) {
      toast.error('Passkey name is required');
      return;
    }
    setIsLoading(true);
    const res = await authClient.passkey.addPasskey({
      name: passkeyName,
    });
    setIsLoading(false);
    if (res?.error) {
      toast.error(res?.error.message);
    } else {
      toast.success('Passkey added successfully. You can now use it to login.');
    }
  };
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletePasskey, setIsDeletePasskey] = useState<boolean>(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-xs md:text-sm">
          <Fingerprint className="mr-2 h-4 w-4" />
          <span>Passkeys {data?.length ? `[${data?.length}]` : ''}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-11/12">
        <DialogHeader>
          <DialogTitle>Passkeys</DialogTitle>
          <DialogDescription>List of passkeys</DialogDescription>
        </DialogHeader>
        {data?.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map(passkey => (
                <TableRow
                  key={passkey.id}
                  className="flex  justify-between items-center"
                >
                  <TableCell>{passkey.name || 'My Passkey'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={async () => {
                        const res = await authClient.passkey.deletePasskey({
                          id: passkey.id,
                          fetchOptions: {
                            onRequest: () => {
                              setIsDeletePasskey(true);
                            },
                            onSuccess: () => {
                              toast('Passkey deleted successfully');
                              setIsDeletePasskey(false);
                            },
                            onError: error => {
                              toast.error(error.error.message);
                              setIsDeletePasskey(false);
                            },
                          },
                        });
                      }}
                    >
                      {isDeletePasskey ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Trash
                          size={15}
                          className="cursor-pointer text-red-600"
                        />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">No passkeys found</p>
        )}
        {!data?.length && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="passkey-name" className="text-sm">
                New Passkey
              </Label>
              <Input
                id="passkey-name"
                value={passkeyName}
                onChange={e => setPasskeyName(e.target.value)}
                placeholder="My Passkey"
              />
            </div>
            <Button type="submit" onClick={handleAddPasskey} className="w-full">
              {isLoading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>
                  <Fingerprint className="mr-2 h-4 w-4" />
                  Create Passkey
                </>
              )}
            </Button>
          </div>
        )}
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} */
