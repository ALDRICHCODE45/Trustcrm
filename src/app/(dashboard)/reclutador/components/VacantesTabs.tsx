import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AlertCircle,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  FileText,
  Mail,
  MessageSquare,
  MessageSquareOff,
  MoreVertical,
  Phone,
  Plus,
  Trash,
  UserCheck,
  UserPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VacancyWithRelations } from "./ReclutadorColumns";
import { format } from "date-fns";

interface DetailsSectionProps {
  vacante: VacancyWithRelations;
}

interface CandidatesSectionProps {
  vacante: VacancyWithRelations;
}

interface CommentsSectionProps {
  vacante: VacancyWithRelations;
}

export const VacanteTabs: React.FC<{ vacante: VacancyWithRelations }> = ({
  vacante,
}) => (
  <Tabs defaultValue="detalles">
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="detalles">Detalles</TabsTrigger>
      <TabsTrigger value="candidatos">Candidatos</TabsTrigger>
      <TabsTrigger value="comentarios">Comentarios</TabsTrigger>
      <TabsTrigger value="documentos">Documentos</TabsTrigger>
    </TabsList>
    <TabsContent value="detalles">
      <DetailsSection vacante={vacante} />
    </TabsContent>
    <TabsContent value="candidatos">
      <CandidatesSection vacante={vacante} />
    </TabsContent>
    <TabsContent value="comentarios">
      <CommentsSection vacante={vacante} />
    </TabsContent>
    <TabsContent value="documentos">
      <DocumentsSection vacante={vacante} />
    </TabsContent>
  </Tabs>
);
interface DocumentsSectionProps {
  vacante: VacancyWithRelations;
}
const DocumentsSection: React.FC<DocumentsSectionProps> = ({ vacante }) => (
  <div className="space-y-6 mt-4">
    <div className="space-y-6 mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Documentos</h3>{" "}
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> <span>Añadir documento</span>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Documento 1 */}
        <Card className="group hover:shadow-md transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-[9999]">
                    <DropdownMenuItem className="cursor-pointer">
                      <Download />
                      <span>Descargar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Edit />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500 cursor-pointer ">
                      <Trash />
                      <span>Eliminar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <div className="font-medium text-lg mb-1">Checklist</div>
                <div className="text-sm text-muted-foreground">
                  Actualizado el 26 Feb, 2025
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="outline"
                  className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                >
                  PDF
                </Badge>
                <span className="text-xs text-muted-foreground">2.4 MB</span>
              </div>

              <Button variant="outline" size="sm">
                <Download />
                <span>Descargar</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documento 2 */}
        <Card className="group hover:shadow-md transition-all duration-200">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-[9999]">
                    <DropdownMenuItem className="cursor-pointer">
                      <Download />
                      <span>Descargar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Edit />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 dark:text-red-400 cursor-pointer">
                      <Trash />
                      <span>Eliminar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <div className="font-medium text-lg mb-1">
                  Muestra de perfil
                </div>
                <div className="text-sm text-muted-foreground">
                  Actualizado el 1 Mar, 2025
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="outline"
                  className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                >
                  DOCX
                </Badge>
                <span className="text-xs text-muted-foreground">1.8 MB</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Descargar</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Añadir documento (card) */}
        <Card className="border-dashed hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 cursor-pointer">
          <CardContent className="p-5 flex flex-col items-center justify-center h-full text-center">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
              <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-medium mb-2">Añadir nuevo documento</h4>
            <p className="text-sm text-muted-foreground">
              Sube archivos PDF, DOCX, XLSX o imágenes
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Documentos recientes (sección opcional) */}
    </div>
  </div>
);

const CandidatesSection: React.FC<CandidatesSectionProps> = ({ vacante }) => (
  <div className="space-y-6 mt-4">
    {/* Existing candidates section content */}
    {/* ... (Keep the existing candidates section content) ... */}
    {vacante.ternaFinal && vacante.ternaFinal.length > 0 ? (
      <div className="space-y-6 mt-4 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-muted-foreground">
            Terna final
          </h4>
          <Badge variant="outline" className="px-3 py-1 bg-background">
            {vacante.ternaFinal.length} candidato(s){" "}
          </Badge>
        </div>
        {/* Lista de candidatos */}
        <div className="space-y-4">
          {vacante.ternaFinal.map((candidato, index) => (
            <Card
              key={index}
              className="hover:bg-accent hover:text-accent-foreground transition-colors p-4 rounded-lg"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <Avatar className="h-14 w-14 border-2 border-primary/10">
                  <AvatarImage src={"/profile"} alt={candidato.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                    {candidato.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                {/* Detalles del candidato */}
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm">{candidato.name}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 mr-1 opacity-70" />
                      <span>{candidato.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-1 opacity-70" />
                      <span>{candidato.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm px-3 py-1.5 hover:bg-primary/10"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Ver CV
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="text-sm px-3 py-1.5"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Seleccionar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground bg-muted/10 rounded-lg mt-4">
        <AlertCircle className="h-10 w-10 mb-4 text-muted-foreground/60" />
        <p className="text-base font-medium mb-2">
          No hay candidatos en la terna final
        </p>
        <p className="text-sm text-center max-w-sm">
          Cuando se agreguen candidatos a la terna final, aparecerán aquí para
          su revisión.
        </p>
        <Button className="mt-4" variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Agregar candidatos
        </Button>
      </div>
    )}
  </div>
);

const CommentsSection: React.FC<CommentsSectionProps> = ({ vacante }) => (
  <div className="space-y-6 mt-4">
    {/* Existing comments section content */}{" "}
    {/* ... (Keep the existing comments section content) ... */}{" "}
    <div className="space-y-6 mt-4 h-[300px] overflow-auto p-3">
      {/* Encabezado con título y botón de añadir */}{" "}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium uppercase text-muted-foreground flex items-center">
          {" "}
          <MessageSquare className="h-4 w-4 mr-2" /> Historial de comentarios
        </h4>{" "}
        <Button size="sm" variant="outline" className="h-8">
          {" "}
          <Plus className="h-4 w-4 mr-2" /> Añadir comentario{" "}
        </Button>
      </div>
      {/* Contenido de los comentarios */}
      {vacante.comentarios && vacante.comentarios.length > 0 ? (
        <div className="space-y-4">
          {/* Barra de tiempo para comentarios */}
          <div className="relative pb-2">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border"></div>

            {vacante.Comments.map((comentario, index) => (
              <div key={comentario.id} className="relative mb-6 last:mb-0">
                {/* Indicador de tiempo */}
                <div className="absolute left-4 top-0 -translate-x-1/2 w-2 h-2 rounded-full bg-primary z-10"></div>

                <Card className={`ml-8 ${index === 0 ? "border-primary" : ""}`}>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={comentario.author.image ?? "/profile"}
                            alt={comentario.author.name}
                            className="w-full h-full object-cover"
                          />
                          <AvatarFallback>
                            {comentario.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium leading-none">
                            {comentario.author.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {comentario.author.role || "Reclutador"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {format(comentario.createdAt, "mm/dd/yy")}
                        </Badge>
                        {index === 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Más reciente
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-sm">{comentario.content}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 bg-muted/30 rounded-lg border border-dashed">
          <MessageSquareOff className="h-10 w-10 mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">No hay comentarios todavía</p>
          <Button variant="outline" size="sm" className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Añadir el primer comentario
          </Button>
        </div>
      )}
    </div>
  </div>
);

const DetailsSection: React.FC<DetailsSectionProps> = ({ vacante }) => (
  <div className="space-y-6 mt-4">
    <div className="bg-muted/30 p-4 rounded-lg border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={vacante.reclutador.image ?? "/profile.jpg"}
              alt={vacante.reclutador.name}
              className="w-full h-full object-cover"
            />
            <AvatarFallback>{vacante.reclutador.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">Reclutador asignado</p>
            <p className="font-medium">{vacante.reclutador.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">{vacante.tipo}</Badge>
          <Badge variant="outline">{vacante.cliente.cuenta}</Badge>
        </div>
      </div>
      {/* Información de cliente y tiempos */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center">
            <Building className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Cliente:</span>
            <span className="ml-2 font-medium">{vacante.cliente.cuenta}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Fecha entrega:
            </span>
            <span className="ml-2 font-medium">
              {vacante.fechaEntrega && format(vacante.fechaEntrega, "mm/dd/yy")}
            </span>
          </div>
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Mes asignado:</span>
            <span className="ml-2 font-medium">Fecha asignacion</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Tiempo transcurrido:
              </span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <span className="font-medium">
                {vacante.tiempoTranscurrido} días
              </span>
            </Button>
          </div>
          <div className="pt-2">
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  vacante.tiempoTranscurrido! > 30
                    ? "bg-red-500"
                    : vacante.tiempoTranscurrido! > 15
                    ? "bg-amber-500"
                    : "bg-green-500"
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    (vacante.tiempoTranscurrido! / 45) * 100
                  )}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0d</span>
              <span>15d</span>
              <span>30d</span>
              <span>45d</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* Información financiera */}
    <div>
      <h4 className="text-sm font-medium uppercase text-muted-foreground mb-3 flex items-center">
        <FileText className="h-4 w-4 mr-2" />
        Información financiera
      </h4>
      <div className="grid grid-cols-3 gap-4">
        <Card className="overflow-hidden">
          <div className="h-1 bg-blue-500"></div>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Salario</div>
            <div className="text-2xl font-semibold mt-1">
              ${vacante.salario!}
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <div className="h-1 bg-purple-500"></div>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Fee</div>
            <div className="text-2xl font-semibold mt-1">{vacante.fee}%</div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <div className="h-1 bg-green-500"></div>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Valor factura</div>
            <div className="text-2xl font-semibold mt-1">
              ${vacante.valorFactura}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    {/* Candidato contratado (condicional) */}
    {vacante.candidatoContratado && (
      <Card className="overflow-hidden border-green-200 dark:border-green-800">
        <div className="h-1 bg-green-500"></div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium">Candidato contratado</h4>
                <p className="text-muted-foreground text-sm">
                  {vacante.candidatoContratado.name}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-1" />
              Ver CV
            </Button>
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);
