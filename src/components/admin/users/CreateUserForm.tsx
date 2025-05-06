
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RoleSelector } from "./RoleSelector";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Schema for form validation
const formSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Contraseña debe tener al menos 6 caracteres" }),
  role: z.string(),
  businessName: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateUserFormProps {
  onUserCreated: () => void;
}

export const CreateUserForm = ({ onUserCreated }: CreateUserFormProps) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "user",
      businessName: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      // 1. Registro en auth
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            role: values.role,
            business_name: values.businessName || null,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // 2. Agregar a user_accounts
        const { error: accountError } = await supabase
          .from('user_accounts')
          .insert({
            id: data.user.id,
            email: values.email.toLowerCase(),
            role: values.role,
            business_name: values.businessName || null,
            has_access: true
          });

        // 3. También asegurar que esté en users_auth
        const { error: authError } = await supabase
          .from('users_auth')
          .insert({
            id: data.user.id,
            email: values.email.toLowerCase()
          });

        if (accountError) {
          console.error('Error adding to user_accounts:', accountError);
          toast.warning(`Usuario creado pero con advertencia: ${accountError.message}`);
        } else if (authError) {
          console.error('Error adding to users_auth:', authError);
          toast.warning(`Usuario creado pero con advertencia: ${authError.message}`);
        } else {
          toast.success("Usuario creado exitosamente");
        }
        
        form.reset();
        onUserCreated();
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(`Error: ${error.message || 'Ha ocurrido un error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <Input 
                  placeholder="correo@ejemplo.com" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Contraseña" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol</FormLabel>
              <FormControl>
                <RoleSelector value={field.value} onValueChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de Empresa</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nombre de la empresa (opcional)" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creando..." : "Crear Usuario"}
        </Button>
      </form>
    </Form>
  );
};
