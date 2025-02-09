
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Upload } from "lucide-react";

const ProfilePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        <Card className="w-72 h-fit bg-gradient-to-b from-sergen-100 to-sergen-50 p-6">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-sergen-500 rounded-full mb-4 relative">
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg">
                <Upload className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <h2 className="text-xl font-semibold">Ultrafrio S.A.C.</h2>
          </div>
        </Card>

        <div className="flex-1">
          <Tabs defaultValue="informacion" className="w-full">
            <TabsList className="w-full justify-start border-b mb-8">
              <TabsTrigger value="informacion" className="data-[state=active]:border-b-2 data-[state=active]:border-sergen-500 rounded-none">
                Información
              </TabsTrigger>
              <TabsTrigger value="contacto" className="data-[state=active]:border-b-2 data-[state=active]:border-sergen-500 rounded-none">
                Contacto
              </TabsTrigger>
              <TabsTrigger value="archivos" className="data-[state=active]:border-b-2 data-[state=active]:border-sergen-500 rounded-none">
                Archivos
              </TabsTrigger>
              <TabsTrigger value="configuracion" className="data-[state=active]:border-b-2 data-[state=active]:border-sergen-500 rounded-none">
                Configuración
              </TabsTrigger>
            </TabsList>

            <TabsContent value="informacion" className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <label className="font-semibold mb-2 block">RAZÓN SOCIAL:</label>
                  <div className="text-gray-700">Ultrafrio S.A.C.</div>
                </div>
                <div>
                  <label className="font-semibold mb-2 block">RUC:</label>
                  <div className="text-gray-700">20608382616</div>
                </div>
                <div>
                  <label className="font-semibold mb-2 block">ACTIVIDAD:</label>
                  <div className="text-gray-700">Proceso de productos hidrobiológicos</div>
                </div>
                <div>
                  <label className="font-semibold mb-2 block">SUMINISTRADOR ELÉCTRICO:</label>
                  <div className="text-gray-700">Pluz Energía</div>
                </div>
                <div>
                  <label className="font-semibold mb-2 block">POTENCIA CONTRATADA:</label>
                  <div className="text-gray-700">500 kW</div>
                </div>
                <div>
                  <label className="font-semibold mb-2 block">VENCIMIENTO DE CONTRATO:</label>
                  <div className="text-gray-700">Abril 2026</div>
                </div>
                <div>
                  <label className="font-semibold mb-2 block">PERIODO DE AVISO:</label>
                  <div className="text-gray-700">12 meses</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contacto" className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <label className="font-semibold mb-2 block">NOMBRES Y APELLIDOS:</label>
                  <div className="text-gray-700">Jefferson Rumichi</div>
                </div>
                <div>
                  <label className="font-semibold mb-2 block">CARGO:</label>
                  <div className="text-gray-700">Jefe técnico de planta</div>
                </div>
                <div>
                  <label className="font-semibold mb-2 block">PERFIL:</label>
                  <div className="text-gray-700">Técnico electricista</div>
                </div>
                <div>
                  <label className="font-semibold mb-2 block">CORREO CORPORATIVO:</label>
                  <div className="text-gray-700">jrumichi@ultrafrio.com</div>
                </div>
                <div>
                  <label className="font-semibold mb-2 block">CELULAR:</label>
                  <div className="text-gray-700">998765421</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="archivos" className="space-y-6">
              <div className="space-y-8">
                <div>
                  <h3 className="font-semibold mb-4">CONTRATOS Y ADENDAS:</h3>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <img src="/pdf-icon.png" alt="PDF" className="w-12 h-12 mx-auto mb-2" />
                      <div className="text-sm">Contrato 2017</div>
                    </div>
                    <div className="text-center">
                      <img src="/pdf-icon.png" alt="PDF" className="w-12 h-12 mx-auto mb-2" />
                      <div className="text-sm">Adenda 2020</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">FACTURA DE SUMINISTRO ELÉCTRICO:</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre'].map((month) => (
                      <div key={month} className="text-center">
                        <img src="/pdf-icon.png" alt="PDF" className="w-12 h-12 mx-auto mb-2" />
                        <div className="text-sm">{month} 2024</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Arrastra o dale clic para subir tu archivo.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="configuracion" className="space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="font-semibold mb-4">ACTUALIZAR DATOS DE CONTACTO</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="font-semibold mb-2 block">NOMBRES Y APELLIDOS:</label>
                      <Input defaultValue="Jefferson Rumichi" />
                    </div>
                    <div>
                      <label className="font-semibold mb-2 block">CARGO:</label>
                      <Input defaultValue="Jefe técnico de planta" />
                    </div>
                    <div>
                      <label className="font-semibold mb-2 block">PERFIL:</label>
                      <Input defaultValue="Técnico electricista" />
                    </div>
                    <div>
                      <label className="font-semibold mb-2 block">CORREO CORPORATIVO:</label>
                      <Input defaultValue="jrumichi@ultrafrio.com" />
                    </div>
                    <div>
                      <label className="font-semibold mb-2 block">CELULAR:</label>
                      <Input defaultValue="998765421" />
                    </div>
                    <Button className="bg-blue-500 hover:bg-blue-600">Actualizar</Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-semibold mb-4">CAMBIAR CONTRASEÑA</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="font-semibold mb-2 block">ACTUAL CONTRASEÑA:</label>
                      <div className="relative">
                        <Input type="password" />
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold mb-2 block">NUEVA CONTRASEÑA:</label>
                      <div className="relative">
                        <Input type="password" />
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold mb-2 block">REPETIR CONTRASEÑA:</label>
                      <div className="relative">
                        <Input type="password" />
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <Button className="bg-blue-500 hover:bg-blue-600">Cambiar contraseña</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
