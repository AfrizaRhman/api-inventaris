import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { CreateKnowledgeDto, UpdateKnowledgeDto } from './dto/knowledge.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('Knowledges')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post()
  @Roles('perhutani', 'admin')
  async create(
    @Body() createKnowledgeDto: CreateKnowledgeDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    createKnowledgeDto.created_by = userId;
    return this.knowledgeService.createKnowledge(createKnowledgeDto);
  }

  @Post('/list')
  @Roles('perhutani', 'admin')
  async findAll(@Body() paginationDto: PaginationDto, @Req() req: any) {
    const additionalWhere: Record<string, any> = {};
    if (req.user.role === 'admin') {
      additionalWhere.odtw_id = req.user.odtw_id;
    }
    console.log('odtw id', req.user.odtw_id, req.user);

    return this.knowledgeService.findAllKnowledgesPaginated(
      paginationDto,
      additionalWhere,
    );
  }

  @Get(':id')
  @Roles('perhutani', 'admin')
  async findOne(@Param('id') id: string) {
    return this.knowledgeService.findKnowledgeById(id);
  }

  @Patch(':id')
  @Roles('perhutani', 'admin')
  async update(
    @Param('id') id: string,
    @Body() updateKnowledgeDto: UpdateKnowledgeDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    updateKnowledgeDto.updated_by = userId;
    return this.knowledgeService.updateKnowledge(id, updateKnowledgeDto);
  }

  @Delete(':id')
  @Roles('perhutani', 'admin')
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.knowledgeService.softDeleteKnowledge(id, userId);
  }
}
